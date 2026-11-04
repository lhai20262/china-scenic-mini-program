const travel = require('../../utils/travel')
const all = travel.allSpots()
const USER_DATA_KEYS = [
  'favoriteScenicSpotIds', 'plannedScenicSpotIds', 'plannedScenicSpotDates',
  'litScenicSpotIds', 'litScenicSpots', 'litScenicSpotDates',
  'travelNotesV1', 'scenicCommentsV1', 'scenicContentFeedbackV1', 'scenicPhotoFeedbackV1',
  'guideFontSizeV1'
]

function collectUserData() {
  const data = {}
  const storage = wx.getStorageInfoSync()
  storage.keys.filter(key => USER_DATA_KEYS.includes(key) || key.indexOf('detailScrollV1:') === 0).forEach(key => {
    data[key] = wx.getStorageSync(key)
  })
  return {
    app: '行迹',
    version: '2026.10',
    exportedAt: new Date().toISOString(),
    data
  }
}

Page({
  data: { tab: '概览', tabs: ['概览', '收藏', '清单', '成就', '数据'], favorites: [], plans: [], lit: [], provinces: 0, completion: 0, achievements: [], monthly: [], routes: [], userDataItems: 0, userDataSize: 0, contentUpdatedAt: '2026年10月29日' },
  onShow() { this.refresh() },
  refresh() {
    const favoriteIds = travel.storageList('favoriteScenicSpotIds')
    const planIds = travel.storageList('plannedScenicSpotIds')
    const litIds = travel.storageList('litScenicSpotIds')
    const favorites = favoriteIds.map(id => all.find(item => item.id === id)).filter(Boolean).map(travel.enrich)
    const plans = planIds.map(id => all.find(item => item.id === id)).filter(Boolean).map(travel.enrich)
    const lit = litIds.map(id => all.find(item => item.id === id)).filter(Boolean).map(travel.enrich)
    const provinces = new Set(lit.map(item => item.province)).size
    const fiveALit = lit.filter(item => item.grade === '5A').length
    const month = new Date().getMonth() + 1
    const monthly = Object.keys(travel.featured).map(key => all.find(item => item.id === key)).filter(Boolean).map(travel.enrich).filter(item => item.recommended).slice(0, 4)
    const routes = Object.keys(travel.featured).slice(0, 3).map(key => {
      const spot = travel.enrich(all.find(item => item.id === key))
      return { ...spot, routeText: spot.route.join(' → ') }
    })
    const achievements = [
      { icon: '✦', name: '初次出发', desc: '点亮第一处景区', unlocked: lit.length >= 1 },
      { icon: '省', name: '跨省旅行者', desc: '点亮5个省份', unlocked: provinces >= 5 },
      { icon: 'A', name: '名胜收藏家', desc: '点亮10处5A景区', unlocked: fiveALit >= 10 },
      { icon: '♡', name: '心愿清单', desc: '收藏5处景区', unlocked: favorites.length >= 5 },
      { icon: '行', name: '山河行者', desc: '累计点亮30处景区', unlocked: lit.length >= 30 },
      { icon: '图', name: '中国足迹', desc: '点亮20个省份', unlocked: provinces >= 20 }
    ]
    const storage = wx.getStorageInfoSync()
    const userDataItems = storage.keys.filter(key => USER_DATA_KEYS.includes(key) || key.indexOf('detailScrollV1:') === 0).length
    this.setData({ favorites, plans, lit, provinces, completion: Math.min(100, Math.round(lit.length / all.length * 100)), achievements, monthly, routes, month, userDataItems, userDataSize: storage.currentSize })
  },
  goBack() { wx.navigateBack() },
  selectTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }) },
  openDetail(e) { const spot = all.find(item => item.id === e.currentTarget.dataset.id); if (spot) wx.navigateTo({ url: travel.detailUrl(spot) }) },
  openNearby() { wx.navigateTo({ url: '/pages/nearby/nearby' }) },
  openPlanner(e) { wx.navigateTo({ url: `/pages/planner/planner?mode=${e.currentTarget.dataset.mode}` }) },
  removeFavorite(e) { travel.toggleStored('favoriteScenicSpotIds', e.currentTarget.dataset.id); this.refresh() },
  removePlan(e) { travel.toggleStored('plannedScenicSpotIds', e.currentTarget.dataset.id); this.refresh() },
  exportUserData() {
    const content = JSON.stringify(collectUserData(), null, 2)
    wx.setClipboardData({
      data: content,
      success: () => wx.showModal({ title: '数据已导出', content: '旅行数据已复制到剪贴板，可粘贴到备忘录或文件中保存。', showCancel: false })
    })
  },
  clearUserData() {
    wx.showModal({
      title: '清除旅行数据',
      content: '将删除收藏、清单、足迹、笔记、评论、纠错记录和阅读位置。图片缓存与小程序本体不会删除。',
      confirmText: '确认清除',
      confirmColor: '#a54b3d',
      success: result => {
        if (!result.confirm) return
        const keys = wx.getStorageInfoSync().keys
        keys.filter(key => USER_DATA_KEYS.includes(key) || key.indexOf('detailScrollV1:') === 0).forEach(key => wx.removeStorageSync(key))
        this.refresh()
        wx.showToast({ title: '旅行数据已清除', icon: 'success' })
      }
    })
  },
  clearPhotoCache() {
    wx.removeStorageSync('scenicPhotoCacheV1')
    this.refresh()
    wx.showToast({ title: '图片缓存已清理', icon: 'success' })
  },
  resetOnboarding() {
    wx.removeStorageSync('travelOnboardingSeenV1')
    this.refresh()
    wx.showToast({ title: '下次进入首页将重新显示', icon: 'none' })
  }
})
