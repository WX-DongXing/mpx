import parser from '@mpxjs/compiler/template-compiler/parser'
import parseRequest from '@mpxjs/utils/parse-request'

export default function selector (content) {
  this.cacheable()
  const mpx = this.getMpx()
  if (!mpx) {
    return content
  }
  const { queryObj } = parseRequest(this.resource)
  const ctorType = queryObj.ctorType
  const type = queryObj.type
  const index = queryObj.index || 0
  const mode = mpx.mode
  const env = mpx.env
  const filePath = this.resourcePath
  const parts = parser(content, {
    filePath,
    needMap: this.sourceMap,
    mode,
    env
  })
  let part = parts[type]
  if (Array.isArray(part)) {
    part = part[index]
  }
  if (!part) {
    let content = ''
    // 补全js内容
    if (type === 'script') {
      switch (ctorType) {
        case 'app':
          content += 'import {createApp} from "@mpxjs/core"\n' +
            'createApp({})\n'
          break
        case 'page':
          content += 'import {createPage} from "@mpxjs/core"\n' +
            'createPage({})\n'
          break
        case 'component':
          content += 'import {createComponent} from "@mpxjs/core"\n' +
            'createComponent({})\n'
      }
    }
    part = { content }
  }
  part = part || { content: '' }
  this.callback(null, part.content, part.map)
}
