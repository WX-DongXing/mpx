import { walkChildren, parseSelector, error, isObject, hasOwn, isFunction } from '@mpxjs/utils'
import { createSelectorQuery, createIntersectionObserver } from '@mpxjs/api-proxy'
const datasetReg = /^data-(.+)$/

function collectDataset (attrs) {
  const dataset = {}
  for (const key in attrs) {
    if (hasOwn(attrs, key)) {
      const matched = datasetReg.exec(key)
      if (matched) {
        dataset[matched[1]] = attrs[key]
      }
    }
  }
  return dataset
}

export default function install (Vue) {
  Vue.prototype.triggerEvent = function (eventName, eventDetail) {
    // 输出Web时自定义组件绑定click事件会和web原生事件冲突，组件内部triggerEvent时会导致事件执行两次，将click事件改为_click来规避此问题
    const escapeEvents = ['click']
    if (escapeEvents.includes(eventName)) {
      eventName = '_' + eventName
    }
    let eventObj = {}
    const dataset = collectDataset(this.$attrs)
    const id = this.$attrs.id || ''
    const timeStamp = +new Date()
    eventObj = {
      type: eventName,
      timeStamp,
      target: { id, dataset, targetDataset: dataset },
      currentTarget: { id, dataset },
      detail: eventDetail
    }
    return this.$emit(eventName, eventObj)
  }
  Vue.prototype.selectComponent = function (selector, all) {
    const result = []
    if (/[>\s]/.test(selector)) {
      const location = this.__mpxProxy.options.mpxFileResource
      error('The selectComponent or selectAllComponents only supports the basic selector, the relation selector is not supported.', location)
    } else {
      const selectorGroups = parseSelector(selector)
      walkChildren(this, selectorGroups, this, result, all)
    }
    return all ? result : result[0]
  }
  Vue.prototype.selectAllComponents = function (selector) {
    return this.selectComponent(selector, true)
  }
  Vue.prototype.createSelectorQuery = function () {
    return createSelectorQuery().in(this)
  }
  Vue.prototype.createIntersectionObserver = function (options) {
    return createIntersectionObserver(this, options)
  }
  Vue.prototype.setData = function (newData, callback) {
    if (!isObject(newData)) {
      error(`The data entry type of the setData method must be object, The type of data ${data} is incorrect`)
      return
    }
    const rawData = this.$data
    Object.entries(newData).forEach(([key, value]) => {
      if (key.includes('.') || key.includes('[')) {
        // key 为索引的路径式设置 (如 'a.b', 'a[0].b.c'）
        const fullKeyItems = formatKey(key)
        let target = this.$data;
        const lastItem = fullKeyItems.pop()

        if (fullKeyItems.length > 0) {
          fullKeyItems.forEach((item) => {
            const nestedKey = item.name;
            if (item.isArray) {
              if (!Array.isArray(target[nestedKey])) {
                this.$set(target, nestedKey, [])
              }
            }
            if (!hasOwn(target, nestedKey)) {
              this.$set(target, nestedKey, {})
            }
            target = item.isArray? target[nestedKey][item.index]: target[nestedKey]
          })
        }

        lastItem.isArray? this.$set(target[lastItem.name], lastItem.index, value) : target[lastItem.name] = value
      } else {
        // key 为正常顶层属性
        if (hasOwn(rawData, key)) {
          rawData[key] = value
        } else {
          // data 不存在属性，通过 $set 设置
          this.$set(rawData, key, value)
        }
      }
    })

    function formatKey (key) {
      const regex = /(\w+)(?:\[(\d+)\])?\.?/g
      let match
      const parsed = []
      while ((match = regex.exec(key)) !== null) {
        const propertyName = match[1]
        const index = match[2]
        const property = {
          name: propertyName,
          isArray: !!index,
          index: index ? parseInt(index, 10) : undefined,
        }
        parsed.push(property);
      }
      return parsed
    }

    if (callback && isFunction(callback)) {
      this.$nextTick(callback.bind(this))
    }
  }
}
