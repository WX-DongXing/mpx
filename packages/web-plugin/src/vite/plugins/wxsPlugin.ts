import { createFilter, Plugin, transformWithEsbuild } from 'vite'
import parseRequest from '@mpxjs/utils/parse-request'

export function createWxsPlugin(): Plugin {
  const filter = createFilter([/\.wxs$/])
  return {
    name: 'vite:mpx-wxs',
    async transform(code, id) {
      const { resourcePath: filename } = parseRequest(id)
      if (!filter(filename)) return
      return await transformWithEsbuild(code, '', {
        format: 'esm',
        sourcefile: filename
      })
    }
  }
}
