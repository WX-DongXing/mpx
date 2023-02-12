import { CREATED } from '../../core/innerLifecycle'

export default function pageStatusMixin (mixinType) {
  if (mixinType === 'page') {
    return {
      data: {
        mpxPageStatus: 'show'
      },
      onShow () {
        this.mpxPageStatus = 'show'
        this.onShow && this.onShow()
      },
      onHide () {
        this.mpxPageStatus = 'hide'
        this.onHide && this.onHide()
      },
      onBack () {
        this.onBack && this.onBack()
      }
    }
  }
  // components
  return {
    [CREATED] () {
      let pageInstance = global.__currentPageInstance
      if (!pageInstance) return
      this.$watch(
        () => pageInstance.mpxPageStatus,
        status => {
          if (!status) return
          const pageLifetimes = (this.$rawOptions && this.$rawOptions.pageLifetimes) || {}
          // show & hide
          if (status in pageLifetimes && typeof pageLifetimes[status] === 'function') {
            pageLifetimes[status].call(this)
          }
        }
      )
    }
  }
}