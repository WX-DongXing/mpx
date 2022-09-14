import parser from '@mpxjs/compiler/template-compiler/parser'
import addQuery from '@mpxjs/utils/add-query'
import { matchCondition } from '@mpxjs/utils/match-condition'
import parseRequest from '@mpxjs/utils/parse-request'
import async from 'async'
import JSON5 from 'json5'
import loaderUtils from 'loader-utils'
import path from 'path'
import { LoaderContext } from 'webpack'
import { MPX_APP_MODULE_ID } from '../../constants'
import { proxyPluginContext } from '../../pluginContextProxy'
import getJSONContent from '../../utils/get-json-content'
import RecordResourceMapDependency from '../dependencies/RecordResourceMapDependency'
import mpx from '../../mpx'
import getEntryName from '../utils/get-entry-name'
import processJSON from '../web/processJSON'
import processScript from '../web/processScript'
import processStyles from '../web/processStyles'
import processTemplate from '../web/processTemplate'

export default function (
  this: LoaderContext<null>,
  content: string
): string | undefined {
  this.cacheable()

  // 兼容处理处理ts-loader中watch-run/updateFile逻辑，直接跳过当前loader及后续的vue-loader返回内容
  if (path.extname(this.resourcePath) === '.ts') {
    this.loaderIndex -= 2
    return content
  }
  if (!mpx) {
    return content
  }
  const { resourcePath, queryObj } = parseRequest(this.resource)

  const packageRoot = queryObj.packageRoot || mpx.currentPackageRoot
  const packageName = packageRoot || 'main'
  const pagesMap = mpx.pagesMap
  const componentsMap = mpx.componentsMap[packageName]
  const mode = mpx.mode
  const env = mpx.env
  const globalSrcMode = mpx.srcMode
  const localSrcMode = queryObj.mode
  const srcMode = localSrcMode || globalSrcMode
  const autoScope = matchCondition(resourcePath, mpx.autoScopeRules)

  let ctorType = 'app'
  if (pagesMap[resourcePath]) {
    // page
    ctorType = 'page'
  } else if (componentsMap[resourcePath]) {
    // component
    ctorType = 'component'
  }

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const loaderContext = this
  const stringifyRequest = (r: string) =>
    loaderUtils.stringifyRequest(loaderContext, r)
  const isProduction = mpx.minimize || process.env.NODE_ENV === 'production'
  const filePath = this.resourcePath
  const moduleId =
    ctorType === 'app' ? MPX_APP_MODULE_ID : 'm' + mpx.pathHash(filePath)

  // 支持资源query传入isPage或isComponent支持页面/组件单独编译
  if (ctorType === 'app' && (queryObj.isComponent || queryObj.isPage)) {
    const entryName =
      getEntryName(this) ||
      mpx.getOutputPath(
        resourcePath,
        queryObj.isComponent ? 'component' : 'page'
      )
    ctorType = queryObj.isComponent ? 'component' : 'page'
    this._module?.addPresentationalDependency(
      new RecordResourceMapDependency(
        resourcePath,
        ctorType,
        entryName,
        packageRoot
      )
    )
  }
  // 将mpx文件 分成四部分
  const parts = parser(content, {
    filePath,
    needMap: this.sourceMap,
    mode,
    env
  })
  let output = ''
  const callback = this.async()

  async.waterfall(
    [
      (callback: any) => {
        getJSONContent(
          parts.json || {},
          loaderContext.context,
          proxyPluginContext(loaderContext),
          mpx.defs,
          loaderContext._compilation?.inputFileSystem
        )
          .then(res => {
            if (parts.json) parts.json.content = res
            callback()
          })
          .catch(callback)
      },
      (callback: any) => {
        const hasScoped =
          parts.styles.some(({ scoped }: any) => scoped) || autoScope
        const templateAttrs = parts.template && parts.template.attrs
        const hasComment = templateAttrs && templateAttrs.comments
        const isNative = false

        let usingComponents = Object.keys(mpx.usingComponents)

        let componentGenerics = {}

        if (parts.json && parts.json.content) {
          try {
            const ret = JSON5.parse(parts.json.content)
            if (ret.usingComponents) {
              usingComponents = usingComponents.concat(
                Object.keys(ret.usingComponents)
              )
            }
            if (ret.componentGenerics) {
              componentGenerics = Object.assign({}, ret.componentGenerics)
            }
          } catch (e) {
            return callback(e)
          }
        }

        // 处理mode为web时输出vue格式文件
        if (ctorType === 'app' && !queryObj.isApp) {
          const request = addQuery(this.resource, { isApp: true })
          const el = mpx.webConfig.el || '#app'
          output += `
      import App from ${stringifyRequest(request)}
      import Vue from 'vue'
      new Vue({
        el: '${el}',
        render: function(h){
          return h(App)
        }
      })\n
      `
          // 直接结束loader进入parse
          this.loaderIndex = -1
          return callback(null, output)
        }

        return async.waterfall(
          [
            (callback: any) => {
              async.parallel(
                [
                  callback => {
                    processTemplate(
                      parts.template,
                      {
                        loaderContext,
                        hasScoped,
                        hasComment,
                        isNative,
                        srcMode,
                        moduleId,
                        ctorType,
                        usingComponents,
                        componentGenerics
                      },
                      callback
                    )
                  },
                  callback => {
                    processStyles(
                      parts.styles,
                      {
                        ctorType,
                        autoScope,
                        moduleId
                      },
                      callback
                    )
                  },
                  callback => {
                    processJSON(
                      parts.json,
                      {
                        loaderContext,
                        pagesMap,
                        componentsMap
                      },
                      callback
                    )
                  }
                ],
                (err, res) => {
                  callback(err, res)
                }
              )
            },
            ([templateRes, stylesRes, jsonRes]: any, callback: any) => {
              output += templateRes.output
              output += stylesRes.output
              output += jsonRes.output
              if (
                ctorType === 'app' &&
                jsonRes.jsonObj.window &&
                jsonRes.jsonObj.window.navigationBarTitleText
              ) {
                mpx.appTitle = jsonRes.jsonObj.window.navigationBarTitleText
              }

              processScript(
                parts.script,
                {
                  loaderContext,
                  ctorType,
                  srcMode,
                  isProduction,
                  componentGenerics,
                  jsonConfig: jsonRes.jsonObj,
                  outputPath: queryObj.outputPath || '',
                  tabBarMap: jsonRes.tabBarMap,
                  tabBarStr: jsonRes.tabBarStr,
                  builtInComponentsMap: templateRes.builtInComponentsMap,
                  genericsInfo: templateRes.genericsInfo,
                  wxsModuleMap: templateRes.wxsModuleMap,
                  localComponentsMap: jsonRes.localComponentsMap,
                  localPagesMap: jsonRes.localPagesMap
                },
                callback
              )
            }
          ],
          (err, scriptRes: any) => {
            if (err) return callback(err)
            output += scriptRes.output
            callback(null, output)
          }
        )
      }
    ],
    callback
  )
}
