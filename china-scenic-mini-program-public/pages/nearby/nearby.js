const travel = require('../../utils/travel')
const all = travel.allSpots()

Page({
  data: { locating: false, denied: false, locationLabel: '尚未定位', nearby: [] },
  onLoad() { this.buildFallback() },
  goBack() { wx.navigateBack() },
  locate() {
    if (this.data.locating) return
    this.setData({ locating: true, denied: false })
    wx.getLocation({
      type: 'gcj02',
      success: result => this.buildNearby(result.latitude, result.longitude),
      fail: () => this.setData({ locating: false, denied: true }),
    })
  },
  buildFallback() {
    const center = travel.provinceCenters.北京
    this.setData({ nearby: this.rank(center[0], center[1]).slice(0, 12), locationLabel: '示例位置 · 北京' })
  },
  buildNearby(lat, lng) {
    const ranked = this.rank(lat, lng)
    const closest = ranked[0]
    this.setData({ nearby: ranked.slice(0, 20), locating: false, denied: false, locationLabel: closest ? `当前位置附近 · ${closest.province}` : '当前位置' })
  },
  rank(lat, lng) {
    return Object.keys(travel.provinceCenters).map(province => {
      const center = travel.provinceCenters[province]
      const candidates = all.filter(item => item.province === province)
      const spot = candidates.find(item => item.grade === '地标') || candidates.find(item => item.grade === '5A') || candidates[0]
      return spot && { ...travel.enrich(spot), distance: travel.distance(lat, lng, center[0], center[1]) }
    }).filter(Boolean).sort((a, b) => a.distance - b.distance)
  },
  openDetail(e) { const spot = all.find(item => item.id === e.currentTarget.dataset.id); if (spot) wx.navigateTo({ url: travel.detailUrl(spot) }) },
  openSettings() { wx.openSetting() }
})
