import { RawSourceMap } from 'source-map'
import load from 'postcss-load-config'

type Mode = 'wx' | 'web' | 'ali' | 'swan'

export interface SFCBlock {
  tag: 'template' | 'script' | 'style'
  content: string
  result?: string
  start: number
  attrs: { [key: string]: string | true }
  priority?: number
  end: number
  src?: string
  map?: RawSourceMap
}

export interface Template extends SFCBlock {
  tag: 'template'
  type: 'template'
  lang?: string
  mode?: Mode
}

export interface Script extends SFCBlock {
  tag: 'script'
  type: 'script'
  mode?: Mode
}

export interface JSON extends SFCBlock {
  tag: 'script'
  type: 'application/json' | 'json'
  attrs: { type: 'application/json' | 'json' }
  src: string
  useJSONJS: boolean
}

export interface Style extends SFCBlock {
  tag: 'style'
  type: 'style'
  scoped?: boolean
}

export interface CompilerResult {
  template: Template | null
  script: Script | null
  json: JSON | null
  styles: Style[]
  customBlocks: []
}

export interface ParseHtmlNode {
  type: number
  tag: string
  children: ParseHtmlNode[]
}
export interface ParseResult {
  meta: {
    builtInComponentsMap?: Record<string, string>
    wxsModuleMap?: Record<string, string>
    wxsContentMap?: Record<string, string>
    genericsInfo?: Record<string, unknown>
  }
  root: ParseHtmlNode
}

interface Compiler {
  parseComponent(
    template: string,
    options: {
      mode: Mode
      defs?: Record<string, unknown>
      env?: string
      filePath?: string
      pad?: 'line'
      needMap?: boolean
    }
  ): CompilerResult
  parse(
    template: string,
    options: {
      warn: (msg: string) => void
      error: (msg: string) => void
      defs: Record<string, unknown>
      mode: Mode
      srcMode: Mode
      isNative: boolean
      basename: string
      i18n: Record<string, unknown> | null
      decodeHTMLText: boolean
      externalClasses: string[]
      checkUsingComponents: boolean
      usingComponents: string[]
      componentGenerics: Record<string, { default?: string }>
      hasComment: boolean
      isNative: boolean
      isComponent: boolean
      hasScoped: boolean
      moduleId: string
      filePath: string
      globalComponents: string[]
    }
  ): ParseResult
  serialize(root: ParseHtmlNode): string
}

export const styleCompiler: {
  pluginCondStrip: (...args: any[]) => load.ResultPlugin
  rpx: (...args: any[]) => load.ResultPlugin
  scopeId: (...args: any[]) => load.ResultPlugin
  transSpecial: (...args: any[]) => load.ResultPlugin
  trim: (...args: any[]) => load.ResultPlugin
  vw: (...args: any[]) => load.ResultPlugin
}

export const templateCompiler: Compiler
