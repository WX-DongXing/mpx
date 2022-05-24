import { reactive } from '../observer/reactive'
import { ReactiveEffect } from '../observer/effect'
import { EffectScope } from '../observer/effectScope'
import { watch } from '../observer/watch'
import { computed } from '../observer/computed'
import { queueJob, nextTick, RenderTask } from '../observer/scheduler'
import EXPORT_MPX from '../index'
import {
  type,
  noop,
  proxy,
  isEmptyObject,
  isPlainObject,
  processUndefined,
  setByPath,
  getByPath,
  diffAndCloneA,
  preProcessRenderData,
  mergeData,
  aIsSubPathOfB,
  getFirstKey,
  makeMap,
  hasOwn,
  isObject,
  isFunction,
  isString
} from '../helper/utils'
import _getByPath from '../helper/getByPath'
import { onRenderCallBack } from '../platform/patch'
import {
  BEFORECREATE,
  CREATED,
  BEFOREMOUNT,
  MOUNTED,
  UPDATED,
  BEFOREDESTROY,
  DESTROYED,
  ONLOAD,
  ONSHOW,
  ONHIDE,
  ONRESIZE
} from './innerLifecycle'
import { warn, error } from '../helper/log'
import { callWithErrorHandling } from '../helper/errorHandling'

let uid = 0

export default class MpxProxy {
  constructor (options, target) {
    this.target = target
    this.uid = uid++
    this.name = options.name || ''
    this.options = options
    // beforeCreate -> created -> mounted -> destroyed
    this.state = BEFORECREATE
    this.ignoreProxyMap = makeMap(EXPORT_MPX.config.ignoreProxyWhiteList)
    if (__mpx_mode__ !== 'web') {
      this.scope = new EffectScope(true)
      // props响应式数据代理
      this.props = {}
      // data响应式数据代理
      this.data = {}
      // 非props key
      this.localKeysMap = {}
      // 收集setup中动态注册的hooks
      this.hooks = {}
      // 渲染函数中收集的数据
      this.renderData = {}
      // 最小渲染数据
      this.miniRenderData = {}
      // 强制更新的数据
      this.forceUpdateData = {}
      // 下次是否需要强制更新全部渲染数据
      this.forceUpdateAll = false
      this.currentRenderTask = null
    }
  }

  created () {
    this.initApi()
    if (__mpx_mode__ !== 'web') {
      setCurrentInstance(this)
      this.initProps()
      this.initSetup()
      unsetCurrentInstance()
    }
    // beforeCreate需要在setup执行过后执行
    this.callHook(BEFORECREATE)

    if (__mpx_mode__ !== 'web') {
      setCurrentInstance(this)
      this.initData()
      this.initComputed()
      this.initWatch()
      unsetCurrentInstance()
    }

    this.state = CREATED
    this.callHook(CREATED)

    if (__mpx_mode__ !== 'web') {
      this.initRender()
    }
  }

  reCreated () {
    // const options = this.options
    // this.state = BEFORECREATE
    // this.callHook(BEFORECREATE)
    // if (__mpx_mode__ !== 'web') {
    //   this.initComputed(options.computed, true)
    //   this.initWatch(options.watch)
    // }
    // this.state = CREATED
    // this.callHook(CREATED)
    // if (__mpx_mode__ !== 'web') {
    //   this.initRender()
    // }
    // nextTick(this.mounted.bind(this), this)
  }

  createRenderTask (isEmptyRender) {
    if ((!this.isMounted() && this.currentRenderTask) || (this.isMounted() && isEmptyRender)) {
      return
    }
    return new RenderTask(this)
  }

  isMounted () {
    return this.state === MOUNTED
  }

  mounted () {
    if (this.state === CREATED) {
      this.state = MOUNTED
      // 用于处理refs等前置工作
      this.callHook(BEFOREMOUNT)
      this.callHook(MOUNTED)
      this.currentRenderTask && this.currentRenderTask.resolve()
    }
  }

  updated () {
    if (this.isMounted()) {
      this.callHook(UPDATED)
    }
  }

  destroyed () {
    this.callHook(BEFOREDESTROY)
    if (__mpx_mode__ !== 'web') {
      this.scope.stop()
    }
    this.callHook(DESTROYED)
    this.state = DESTROYED
  }

  isDestroyed () {
    return this.state === DESTROYED
  }

  createProxyConflictHandler (owner) {
    return (key) => {
      if (this.ignoreProxyMap[key]) {
        error(`The ${owner} key [${key}] is a reserved keyword of miniprogram, please check and rename it.`, this.options.mpxFileResource)
        return false
      }
      error(`The ${owner} key [${key}] exist in the current instance already, please check and rename it.`, this.options.mpxFileResource)
    }
  }

  initApi () {
    // 挂载扩展属性到实例上
    proxy(this.target, EXPORT_MPX.prototype, undefined, true, this.createProxyConflictHandler('mpx.prototype'))
    // 挂载混合模式下createPage中的自定义属性，模拟原生Page构造器的表现
    if (this.options.__type__ === 'page' && !this.options.__pageCtor__) {
      proxy(this.target, this.options, this.options.mpxCustomKeysForBlend, false, this.createProxyConflictHandler('page options'))
    }
    if (__mpx_mode__ !== 'web') {
      // 挂载$watch
      this.target.$watch = this.watch.bind(this)
      // 强制执行render
      this.target.$forceUpdate = this.forceUpdate.bind(this)
      this.target.$nextTick = fn => nextTick(fn, this)
    }
  }

  initProps () {
    this.props = diffAndCloneA(this.target.__getProps(this.options)).clone
    reactive(this.props)
    proxy(this.target, this.props, undefined, false, this.createProxyConflictHandler('props'))
  }

  initSetup () {
    const setup = this.options.setup
    if (setup) {
      const setupResult = callWithErrorHandling(setup, this, 'setup function', [
        this.props,
        {
          triggerEvent: this.target.triggerEvent.bind(this.target),
          refs: this.target.$refs || (this.target.$refs = {}),
          nextTick: fn => nextTick(fn, this),
          forceUpdate: this.forceUpdate.bind(this),
          selectComponent: this.target.selectComponent.bind(this.target),
          selectAllComponents: this.target.selectAllComponents.bind(this.target),
          createSelectorQuery: this.target.createSelectorQuery.bind(this.target),
          createIntersectionObserver: this.target.createIntersectionObserver.bind(this.target)
        }
      ])
      if (!isObject(setupResult)) {
        error(`Setup() should return a object, received: ${type(setupResult)}.`, this.options.mpxFileResource)
        return
      }
      proxy(this.target, setupResult, undefined, false, this.createProxyConflictHandler('setup result'))
      this.collectLocalKeys(setupResult, (key, val) => !isFunction(val))
    }
  }

  initData () {
    const data = this.options.data
    const dataFn = this.options.dataFn
    // 之所以没有直接使用initialData，而是通过对原始dataOpt进行深clone获取初始数据对象，主要是为了避免小程序自身序列化时错误地转换数据对象，比如将promise转为普通object
    this.data = diffAndCloneA(data || {}).clone
    // 执行dataFn
    if (isFunction(dataFn)) {
      Object.assign(this.data, callWithErrorHandling(dataFn.bind(this.target), this, 'data function'))
    }
    reactive(this.data)
    proxy(this.target, this.data, undefined, false, this.createProxyConflictHandler('data'))
    this.collectLocalKeys(this.data)
  }

  initComputed () {
    const computedOpt = this.options.computed
    if (computedOpt) {
      const computedObj = {}
      Object.entries(computedOpt).forEach(([key, opt]) => {
        const get = isFunction(opt)
          ? opt.bind(this.target)
          : isFunction(opt.get)
            ? opt.get.bind(this.target)
            : noop

        const set = !isFunction(opt) && isFunction(opt.set)
          ? opt.set.bind(this.target)
          : () => warn(`Write operation failed: computed property "${key}" is readonly.`, this.options.mpxFileResource)

        computedObj[key] = computed({ get, set })
      })
      this.collectLocalKeys(computedObj)
      proxy(this.target, computedObj, undefined, false, this.createProxyConflictHandler('computed'))
    }
  }

  initWatch () {
    const watch = this.options.watch
    if (watch) {
      Object.entries(watch).forEach(([key, handler]) => {
        if (Array.isArray(handler)) {
          for (let i = 0; i < handler.length; i++) {
            this.watch(key, handler[i])
          }
        } else {
          this.watch(key, handler)
        }
      })
    }
  }

  watch (source, cb, options) {
    const target = this.target
    const getter = isString(source)
      ? () => getByPath(target, source)
      : source.bind(target)

    if (isObject(cb)) {
      options = cb
      cb = cb.handler
    }

    if (isString(cb) && target[cb]) {
      cb = target[cb]
    }

    cb = cb || noop

    const cur = currentInstance
    setCurrentInstance(this)

    const res = watch(getter, cb.bind(target), options)

    if (cur) setCurrentInstance(cur)
    else unsetCurrentInstance()

    return res
  }

  collectLocalKeys (data, filter = () => true) {
    Object.keys(data).filter((key) => filter(key, data[key])).forEach((key) => {
      this.localKeysMap[key] = true
    })
  }

  callHook (hookName, params, hooksOnly) {
    const hook = this.options[hookName]
    const hooks = this.hooks[hookName] || []
    let result
    if (isFunction(hook) && !hooksOnly) {
      result = callWithErrorHandling(hook.bind(this.target), this, `${hookName} hook`, params)
    }
    hooks.forEach((hook) => {
      result = params ? hook(...params) : hook()
    })
    return result
  }

  hasHook (hookName) {
    return !!(this.options[hookName] || this.hooks[hookName])
  }

  render () {
    const renderData = {}
    Object.keys(this.localKeysMap).forEach((key) => {
      renderData[key] = this.target[key]
    })
    this.doRender(this.processRenderDataWithStrictDiff(renderData))
  }

  renderWithData () {
    const renderData = preProcessRenderData(this.renderData)
    this.doRender(this.processRenderDataWithStrictDiff(renderData))
    // 重置renderData准备下次收集
    this.renderData = {}
  }

  processRenderDataWithDiffData (result, key, diffData) {
    Object.keys(diffData).forEach((subKey) => {
      result[key + subKey] = diffData[subKey]
    })
  }

  processRenderDataWithStrictDiff (renderData) {
    const result = {}
    for (let key in renderData) {
      if (hasOwn(renderData, key)) {
        const data = renderData[key]
        const firstKey = getFirstKey(key)
        if (!this.localKeysMap[firstKey]) {
          continue
        }
        // 外部clone，用于只需要clone的场景
        let clone
        if (hasOwn(this.miniRenderData, key)) {
          const { clone: localClone, diff, diffData } = diffAndCloneA(data, this.miniRenderData[key])
          clone = localClone
          if (diff) {
            this.miniRenderData[key] = clone
            if (diffData && EXPORT_MPX.config.useStrictDiff) {
              this.processRenderDataWithDiffData(result, key, diffData)
            } else {
              result[key] = clone
            }
          }
        } else {
          let processed = false
          const miniRenderDataKeys = Object.keys(this.miniRenderData)
          for (let i = 0; i < miniRenderDataKeys.length; i++) {
            const tarKey = miniRenderDataKeys[i]
            if (aIsSubPathOfB(tarKey, key)) {
              if (!clone) clone = diffAndCloneA(data).clone
              delete this.miniRenderData[tarKey]
              this.miniRenderData[key] = result[key] = clone
              processed = true
              continue
            }
            const subPath = aIsSubPathOfB(key, tarKey)
            if (subPath) {
              // setByPath 更新miniRenderData中的子数据
              _getByPath(this.miniRenderData[tarKey], subPath, (current, subKey, meta) => {
                if (meta.isEnd) {
                  const { clone, diff, diffData } = diffAndCloneA(data, current[subKey])
                  if (diff) {
                    current[subKey] = clone
                    if (diffData && EXPORT_MPX.config.useStrictDiff) {
                      this.processRenderDataWithDiffData(result, key, diffData)
                    } else {
                      result[key] = clone
                    }
                  }
                } else if (!current[subKey]) {
                  current[subKey] = {}
                }
                return current[subKey]
              })
              processed = true
              break
            }
          }
          if (!processed) {
            // 如果当前数据和上次的miniRenderData完全无关，但存在于组件的视图数据中，则与组件视图数据进行diff
            if (this.target.data && hasOwn(this.target.data, firstKey)) {
              const localInitialData = getByPath(this.target.data, key)
              const { clone, diff, diffData } = diffAndCloneA(data, localInitialData)
              this.miniRenderData[key] = clone
              if (diff) {
                if (diffData && EXPORT_MPX.config.useStrictDiff) {
                  this.processRenderDataWithDiffData(result, key, diffData)
                } else {
                  result[key] = clone
                }
              }
            } else {
              if (!clone) clone = diffAndCloneA(data).clone
              this.miniRenderData[key] = result[key] = clone
            }
          }
        }
        if (this.forceUpdateAll) {
          if (!clone) clone = diffAndCloneA(data).clone
          this.forceUpdateData[key] = clone
        }
      }
    }
    return result
  }

  doRender (data, cb) {
    if (typeof this.target.__render !== 'function') {
      error('Please specify a [__render] function to render view.', this.options.mpxFileResource)
      return
    }
    if (typeof cb !== 'function') {
      cb = undefined
    }

    const isEmpty = isEmptyObject(data) && isEmptyObject(this.forceUpdateData)
    const renderTask = this.createRenderTask(isEmpty)

    if (isEmpty) {
      cb && cb()
      return
    }

    // 使用forceUpdateData后清空
    if (!isEmptyObject(this.forceUpdateData)) {
      data = mergeData({}, data, this.forceUpdateData)
      this.forceUpdateData = {}
      this.forceUpdateAll = false
    }

    /**
     * mounted之后才接收回调来触发updated钩子，换言之mounted之前修改数据是不会触发updated的
     */
    let callback = cb
    if (this.isMounted()) {
      callback = () => {
        cb && cb()
        onRenderCallBack(this)
        renderTask && renderTask.resolve()
      }
    }
    data = processUndefined(data)
    if (typeof EXPORT_MPX.config.setDataHandler === 'function') {
      try {
        EXPORT_MPX.config.setDataHandler(data, this.target)
      } catch (e) {
      }
    }
    this.target.__render(data, callback)
  }

  initRender () {
    if (this.options.__nativeRender__) return this.doRender()

    this.effect = new ReactiveEffect(() => {
      if (this.target.__injectedRender) {
        try {
          return this.target.__injectedRender()
        } catch (e) {
          warn(`Failed to execute render function, degrade to full-set-data mode.`, this.options.mpxFileResource, e)
          this.render()
        }
      } else {
        this.render()
      }
    }, () => queueJob(update), this.scope)

    const update = this.effect.run.bind(this.effect)
    update.id = this.uid
    update()
  }

  forceUpdate (data, options, callback) {
    if (isFunction(data)) {
      callback = data
      data = undefined
    }

    options = options || {}

    if (isFunction(options)) {
      callback = options
      options = {}
    }

    if (isPlainObject(data)) {
      this.forceUpdateData = data
      Object.keys(this.forceUpdateData).forEach(key => {
        if (!this.options.__nativeRender__ && !this.localKeysMap[getFirstKey(key)]) {
          warn(`ForceUpdate data includes a props/computed key [${key}], which may yield a unexpected result.`, this.options.mpxFileResource)
        }
        setByPath(this.data, key, this.forceUpdateData[key])
      })
    } else {
      this.forceUpdateAll = true
    }

    callback && nextTick(callback.bind(this.target), this)

    if (this.effect) {
      options.sync ? this.effect.run() : this.effect.update()
    } else {
      if (this.forceUpdateAll) {
        Object.keys(this.data).forEach((key) => {
          if (this.localKeysMap[key]) {
            this.forceUpdateData[key] = diffAndCloneA(this.data[key]).clone
          }
        })
      }
      options.sync ? this.doRender() : queueJob(this.doRender.bind(this))
    }
  }
}

export let currentInstance = null

export const getCurrentInstance = () => currentInstance?.target

export const setCurrentInstance = (instance) => {
  currentInstance = instance
  instance.scope.on()
}

export const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off()
  currentInstance = null
}

export const injectHook = (hookName, hook, instance = currentInstance) => {
  if (instance) {
    const wrappedHook = (...args) => {
      if (instance.isDestroyed()) return
      setCurrentInstance(instance)
      const res = callWithErrorHandling(hook, instance, `${hookName} hook`, args)
      unsetCurrentInstance()
      return res
    }
    if (isFunction(hook)) (instance.hooks[hookName] || (instance.hooks[hookName] = [])).push(wrappedHook)
  }
}

export const onBeforeCreate = (fn) => injectHook(BEFORECREATE, fn)
export const onCreated = (fn) => injectHook(CREATED, fn)
export const onBeforeMount = (fn) => injectHook(BEFOREMOUNT, fn)
export const onMounted = (fn) => injectHook(MOUNTED, fn)
export const onUpdated = (fn) => injectHook(UPDATED, fn)
export const onBeforeDestroy = (fn) => injectHook(BEFOREDESTROY, fn)
export const onDestroyed = (fn) => injectHook(DESTROYED, fn)
export const onLoad = (fn) => injectHook(ONLOAD, fn)
export const onShow = (fn) => injectHook(ONSHOW, fn)
export const onHide = (fn) => injectHook(ONHIDE, fn)
export const onResize = (fn) => injectHook(ONRESIZE, fn)
