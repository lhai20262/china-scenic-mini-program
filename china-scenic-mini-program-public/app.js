// app.js
App({
  globalData: {
    networkConnected: true,
    cloudEnvId: 'eval-lifecycle-d9gmc2t5n2e707cba',
    contentVersion: '2026.10',
    contentUpdatedAt: '2026年10月29日'
  },
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.cloudEnvId,
        traceUser: true
      })
    }
    wx.getNetworkType({
      success: result => { this.globalData.networkConnected = result.networkType !== 'none' }
    })
    wx.onNetworkStatusChange(result => {
      const wasConnected = this.globalData.networkConnected
      this.globalData.networkConnected = result.isConnected
      if (!result.isConnected) {
        wx.showToast({ title: '网络已断开，部分图片暂不可用', icon: 'none', duration: 2600 })
      } else if (!wasConnected) {
        wx.showToast({ title: '网络已恢复', icon: 'success', duration: 1600 })
      }
    })
  }
})
