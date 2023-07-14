const hasOwn = require('../utils/has-own')
const loaderUtils = require('loader-utils')
const normalize = require('../utils/normalize')
const createHelpers = require('../helpers')
const tabBarContainerPath = normalize.lib('runtime/components/web/mpx-tab-bar-container.vue')
const tabBarPath = normalize.lib('runtime/components/web/mpx-tab-bar.vue')
const addQuery = require('../utils/add-query')

function stringifyRequest (loaderContext, request) {
  return loaderUtils.stringifyRequest(loaderContext, request)
}

function shallowStringify (obj) {
  const arr = []
  for (const key in obj) {
    if (hasOwn(obj, key)) {
      let value = obj[key]
      if (Array.isArray(value)) {
        value = `[${value.join(',')}]`
      }
      arr.push(`'${key}':${value}`)
    }
  }
  return `{${arr.join(',')}}`
}

function getAsyncChunkName (chunkName) {
  if (chunkName && typeof chunkName !== 'boolean') {
    return `/* webpackChunkName: "${chunkName}" */`
  }
  return ''
}

function buildComponentsMap ({ localComponentsMap, builtInComponentsMap, loaderContext }) {
  const componentsMap = {}
  if (localComponentsMap) {
    Object.keys(localComponentsMap).forEach((componentName) => {
      const componentCfg = localComponentsMap[componentName]
      const componentRequest = stringifyRequest(loaderContext, componentCfg.resource)
      if (componentCfg.async) {
        componentsMap[componentName] = `()=>import(${getAsyncChunkName(componentCfg.async)}${componentRequest}).then(res => getComponent(res))`
      } else {
        componentsMap[componentName] = `getComponent(require(${componentRequest}))`
      }
    })
  }
  if (builtInComponentsMap) {
    Object.keys(builtInComponentsMap).forEach((componentName) => {
      const componentCfg = builtInComponentsMap[componentName]
      const componentRequest = stringifyRequest(loaderContext, componentCfg.resource)
      componentsMap[componentName] = `getComponent(require(${componentRequest}), { __mpxBuiltIn: true })`
    })
  }
  return componentsMap
}

function buildPagesMap ({ localPagesMap, loaderContext, tabBar, tabBarMap, tabBarStr }) {
  let globalTabBar = ''
  let firstPage = ''
  const pagesMap = {}
  const tabBarPagesMap = {}
  if (tabBar && tabBarMap) {
    // 挂载tabBar组件
    const tabBarRequest = stringifyRequest(loaderContext, addQuery(tabBar.custom ? './custom-tab-bar/index' : tabBarPath, { isComponent: true }))
    tabBarPagesMap['mpx-tab-bar'] = `getComponent(require(${tabBarRequest}))`
    // 挂载tabBar页面
    Object.keys(tabBarMap).forEach((pagePath) => {
      const pageCfg = localPagesMap[pagePath]
      if (pageCfg) {
        const pageRequest = stringifyRequest(loaderContext, pageCfg.resource)
        if (pageCfg.async) {
          tabBarPagesMap[pagePath] = `()=>import(${getAsyncChunkName(pageCfg.async)}${pageRequest}).then(res => getComponent(res, { __mpxPageRoute: ${JSON.stringify(pagePath)} }))`
        } else {
          tabBarPagesMap[pagePath] = `getComponent(require(${pageRequest}), { __mpxPageRoute: ${JSON.stringify(pagePath)} })`
        }
      } else {
        loaderContext.emitWarning(
          new Error('[json processor][' + loaderContext.resource + ']: ' + `TabBar page path ${pagePath} is not exist in local page map, please check!`)
        )
      }
    })
  }
  if (tabBarStr && tabBarPagesMap) {
    globalTabBar += `  global.__tabBar = ${tabBarStr}
                        Vue.observable(global.__tabBar)
                        // @ts-ignore
                        global.__tabBarPagesMap = ${shallowStringify(tabBarPagesMap)}\n`
  }
  Object.keys(localPagesMap).forEach((pagePath) => {
    const pageCfg = localPagesMap[pagePath]
    const pageRequest = stringifyRequest(loaderContext, pageCfg.resource)
    if (tabBarMap && tabBarMap[pagePath]) {
      pagesMap[pagePath] = `getComponent(require(${stringifyRequest(loaderContext, tabBarContainerPath)}), { __mpxBuiltIn: true })`
    } else {
      if (pageCfg.async) {
        pagesMap[pagePath] = `()=>import(${getAsyncChunkName(pageCfg.async)} ${pageRequest}).then(res => getComponent(res, { __mpxPageRoute: ${JSON.stringify(pagePath)} }))`
      } else {
        // 为了保持小程序中app->page->component的js执行顺序，所有的page和component都改为require引入
        pagesMap[pagePath] = `getComponent(require(${pageRequest}), { __mpxPageRoute: ${JSON.stringify(pagePath)} })`
      }
    }

    if (pageCfg.isFirst) {
      firstPage = pagePath
    }
  })
  return {
    pagesMap,
    firstPage,
    globalTabBar
  }
}

function getRequireScript ({ ctorType, script, loaderContext }) {
  let content = '  /** script content **/\n'
  const extraOptions = { ctorType, lang: script.lang || 'js' }
  const { getRequire } = createHelpers(loaderContext)
  content += `  ${getRequire('script', script, extraOptions)}\n`
  return content
}

function buildGlobalParams ({ moduleId, scriptSrcMode, loaderContext, isProduction, jsonConfig, webConfig, isMain, globalTabBar }) {
  let content = ''
  if (isMain) {
    content += `global.getApp = function(){}
    global.getCurrentPages = function () {
      if (!(typeof window !== 'undefined')) {
        console.error('[Mpx runtime error]: Dangerous API! global.getCurrentPages is running in non browser environment, It may cause some problems, please use this method with caution')
        return
      }
      if (!global.__mpxRouter) return []
      // @ts-ignore
      return global.__mpxRouter.stack.map(item => {
        let page
        const vnode = item.vnode
        if (vnode && vnode.componentInstance) {
          page = vnode.tag.endsWith('mpx-tab-bar-container') ? vnode.componentInstance.$refs.tabBarPage : vnode.componentInstance
        }
        return page || { route: item.path.slice(1) }
      })
    }
    global.__networkTimeout = ${JSON.stringify(jsonConfig.networkTimeout)}
    global.__mpxGenericsMap = {}
    global.__mpxOptionsMap = {}
    global.__style = ${JSON.stringify(jsonConfig.style || 'v1')}
    global.__mpxPageConfig = ${JSON.stringify(jsonConfig.window)}
    global.__mpxTransRpxFn = ${webConfig.transRpxFn}\n`
    if (globalTabBar) {
      content += globalTabBar
    }
  }
  content += `  global.currentModuleId = ${JSON.stringify(moduleId)}\n`
  content += `  global.currentSrcMode = ${JSON.stringify(scriptSrcMode)}\n`
  content += `  global.currentInject = ${JSON.stringify({ moduleId })}\n`
  if (!isProduction) {
    content += `  global.currentResource = ${JSON.stringify(loaderContext.resourcePath)}\n`
  }
  return content
}

function buildI18n ({ i18n, loaderContext }) {
  let i18nContent = ''
  const i18nObj = Object.assign({}, i18n)
  i18nContent += `  import VueI18n from 'vue-i18n'
          import { createI18n } from 'vue-i18n-bridge'
          Vue.use(VueI18n , { bridge: true })\n`
  const requestObj = {}
  const i18nKeys = ['messages', 'dateTimeFormats', 'numberFormats']
  i18nKeys.forEach((key) => {
    if (i18nObj[`${key}Path`]) {
      requestObj[key] = stringifyRequest(loaderContext, i18nObj[`${key}Path`])
      delete i18nObj[`${key}Path`]
    }
  })
  i18nContent += `  const i18nPageConfig = {}\n`
  i18nContent += `  const i18nCfg = ${JSON.stringify(i18nObj)}\n`
  Object.keys(requestObj).forEach((key) => {
    i18nContent += `  i18nCfg.${key} = require(${requestObj[key]})\n`
  })
  i18nContent += '  i18nCfg.legacy = false\n'
  i18nContent += '  i18nPageConfig.i18nCfg = i18nCfg\n'
  i18nContent += '  i18nPageConfig.createI18n = createI18n\n'
  i18nContent += '  i18nPageConfig.VueI18n = VueI18n\n'
  return i18nContent
  // i18nContent += `  const i18n = createI18n(i18nCfg, VueI18n)
  //                       Vue.use(i18n)
  //                       Mpx.i18n = i18n\n`
}

module.exports = {
  buildPagesMap,
  buildComponentsMap,
  getRequireScript,
  buildGlobalParams,
  shallowStringify,
  getAsyncChunkName,
  stringifyRequest,
  buildI18n
}
