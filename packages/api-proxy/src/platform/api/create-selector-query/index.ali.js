import { noop } from '../../../common/js'

function createSelectorQuery (options = {}) {
  const selectorQuery = my.createSelectorQuery(options)
  const proxyMethods = ['boundingClientRect', 'scrollOffset']
  const cbs = []
  proxyMethods.forEach((name) => {
    const originalMethod = selectorQuery[name]
    selectorQuery[name] = function (cb = noop) {
      cbs.push(cb)
      return originalMethod.call(this)
    }
  })

  const originalExec = selectorQuery.exec
  selectorQuery.exec = function (originalCb = noop) {
    const cb = function (results) {
      results.forEach((item, index) => {
        cbs[index] && cbs[index](item)
      })
      originalCb(results)
    }
    return originalExec.call(this, cb)
  }

  selectorQuery.in = function () {
    return this
  }

  return selectorQuery
}

export {
  createSelectorQuery
}
