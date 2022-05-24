import { warn } from '../helper/log'
import { ReactiveEffect } from './effect'
import { isRef } from './ref'
import { isReactive } from './reactive'
import { queuePreFlushCb, queuePostFlushCb, nextTick } from './scheduler'
import { callWithErrorHandling } from '../helper/errorHandling'
import { currentInstance } from '../core/proxy'
import { isFunction, isObject, isArray, noop, remove, isPlainObject } from '../helper/utils'

export function watchEffect (effect, options) {
  return watch(effect, null, options)
}

export function watchPostEffect (effect, options) {
  return watch(effect, null, { ...options, flush: 'post' })
}

export function watchSyncEffect (effect, options) {
  return watch(effect, null, { ...options, flush: 'sync' })
}

const warnInvalidSource = (s) => {
  warn(`Invalid watch source: ${s}\nA watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`)
}

const shouldTrigger = (value, oldValue) => !Object.is(value, oldValue) || isObject(value)

const processWatchOptionsCompat = (options) => {
  const newOptions = { ...options }
  if (options.sync) {
    newOptions.flush = 'sync'
  }
  return newOptions
}

const wrapPostFlushCb = (job, instance) => instance ? () => nextTick(job, instance) : job

export function watch (source, cb, options = {}) {
  let { immediate, deep, flush } = processWatchOptionsCompat(options)
  const instance = currentInstance
  let getter
  let isMultiSource = false
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    deep = true
  } else if (isArray(source)) {
    isMultiSource = true
    getter = () =>
      source.map(s => {
        if (isRef(s)) {
          return s.value
        } else if (isReactive(s)) {
          return traverse(s)
        } else if (isFunction(s)) {
          return callWithErrorHandling(s, instance, 'watch getter')
        } else {
          warnInvalidSource(s)
        }
      })
  } else if (isFunction(source)) {
    if (cb) {
      // getter with cb
      getter = () => callWithErrorHandling(source, instance, 'watch getter')
    } else {
      // no cb -> simple effect
      getter = () => {
        if (instance && instance.isDestroyed()) {
          return
        }
        if (cleanup) {
          cleanup()
        }
        return callWithErrorHandling(source, instance, 'watch callback', [onCleanup])
      }
    }
  } else {
    getter = noop
    warnInvalidSource(source)
  }

  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let cleanup
  let onCleanup = (fn) => {
    cleanup = effect.onStop = () => callWithErrorHandling(fn, instance, 'watch cleanup')
  }

  let oldValue = isMultiSource ? [] : undefined
  let job = () => {
    if (!effect.active) return
    if (cb) {
      const newValue = effect.run()
      if (
        deep ||
        (isMultiSource
          ? newValue.some((v, i) => shouldTrigger(v, oldValue[i]))
          : shouldTrigger(newValue, oldValue))
      ) {
        // cleanup before running cb again
        if (cleanup) {
          cleanup()
        }
        callWithErrorHandling(cb, instance, 'watch callback', [newValue, oldValue, onCleanup])
        oldValue = newValue
      }
    } else {
      // watchEffect
      effect.run()
    }
  }

  let scheduler
  if (flush === 'sync') {
    // the scheduler function gets called directly
    scheduler = job
  } else if (flush === 'post') {
    job = wrapPostFlushCb(job, instance)
    scheduler = () => queuePostFlushCb(job)
  } else {
    // default: 'pre'
    scheduler = () => queuePreFlushCb(job)
  }

  job.allowRecurse = !!cb

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      // todo 实现immediateAsync
      job()
    } else {
      oldValue = effect.run()
    }
  } else if (flush === 'post') {
    queuePostFlushCb(wrapPostFlushCb(effect.run.bind(effect), instance))
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect)
    }
  }
}

export function traverse (value, seen) {
  if (!isObject(value)) return value
  seen = seen || new Set()
  if (seen.has(value)) return value
  seen.add(value)
  if (isRef(value)) {
    traverse(value.value, seen)
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], seen)
    }
  }
  return value
}
