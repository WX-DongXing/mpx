import { isObject, isFunction, error } from '@mpxjs/utils'

export default function setDataMixin () {
  return {
    beforeCreate () {
      Object.defineProperty(this, 'data', {
        get () {
          return Object.assign({}, this.$data, this.$props)
        },
        configurable: true
      })
    }
  }
}