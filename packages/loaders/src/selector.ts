import path from 'path'
import { templateCompiler } from '@mpxjs/compiler'
import { parseRequest, tsWatchRunLoaderFilter } from '@mpxjs/compile-utils'

import { LoaderDefinition } from 'webpack'

interface Options {
  mode?: string
  env?: string
}

const selector: LoaderDefinition = function (content: string) {
  this.cacheable()

  // 兼容处理处理ts-loader中watch-run/updateFile逻辑，直接跳过当前loader及后续的loader返回内容
  const pathExtname = path.extname(this.resourcePath)
  if (!['.vue', '.mpx'].includes(pathExtname)) {
    this.loaderIndex = tsWatchRunLoaderFilter(this.loaders, this.loaderIndex)
    return content
  }

  // 移除mpx访问依赖，支持 thread-loader
  const { mode, env } = <Options>this.getOptions() || {}
  if (!mode && !env) {
    return content
  }

  const { queryObj } = parseRequest(this.resource)
  const ctorType = queryObj.ctorType
  const type = queryObj.type
  const index = queryObj.index || 0

  const filePath = this.resourcePath
  const parts = templateCompiler.parser(content, {
    filePath,
    needMap: this.sourceMap,
    mode,
    env
  })
  let part = parts[type as string]
  if (Array.isArray(part)) {
    part = part[index as number]
  }
  if (!part) {
    let content = ''
    // 补全js内容
    if (type === 'script') {
      switch (ctorType) {
        case 'app':
          content +=
            'import {createApp} from "@mpxjs/core"\n' + 'createApp({})\n'
          break
        case 'page':
          content +=
            'import {createPage} from "@mpxjs/core"\n' + 'createPage({})\n'
          break
        case 'component':
          content +=
            'import {createComponent} from "@mpxjs/core"\n' +
            'createComponent({})\n'
      }
    }
    part = { content }
  }
  part = part || { content: '' }
  this.callback(null, part.content, part.map)
}

export default selector
