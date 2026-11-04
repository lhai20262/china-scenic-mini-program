const travel = require('../../utils/travel')
const all = travel.allSpots()
const today = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

Page({
  data: {
    mode: '日历', modes: ['日历', '自动行程', '时间轴', '随机目的地'],
    plans: [], timeline: [], provinces: ['全部'], provinceIndex: 0,
    days: ['1天', '2天', '3天', '4天', '5天'], dayIndex: 1,
    preferences: ['综合', '自然风光', '历史人文', '轻松游'], preferenceIndex: 0,
    itinerary: [], randomGrades: ['全部', '5A', '4A', '3A', '地标'], randomGrade: '全部', randomSpot: null,
    today: today()
  },
  onLoad(options) {
    const provinces = ['全部', ...Array.from(new Set(all.map(item => item.province))).filter(Boolean).sort()]
    this.setData({ provinces, mode: options.mode || '日历' })
  },
  onShow() { this.refresh() },
  goBack() { wx.navigateBack() },
  selectMode(e) { this.setData({ mode: e.currentTarget.dataset.mode }) },
  refresh() {
    const planDates = wx.getStorageSync('plannedScenicSpotDates') || {}
    const notes = wx.getStorageSync('travelNotesV1') || {}
    const visitDates = wx.getStorageSync('litScenicSpotDates') || {}
    const plans = travel.storageList('plannedScenicSpotIds').map(id => all.find(item => item.id === id)).filter(Boolean).map(item => {
      const planDate = planDates[item.id] || this.data.today
      return { ...travel.enrich(item), planDate, planMonth: planDate.slice(5, 7), planDay: planDate.slice(8, 10) }
    }).sort((a, b) => a.planDate.localeCompare(b.planDate))
    const timeline = travel.storageList('litScenicSpotIds').map(id => all.find(item => item.id === id)).filter(Boolean).map(item => ({ ...travel.enrich(item), visitDate: visitDates[item.id] || '此前到访', note: notes[item.id] && notes[item.id].text || '', rating: notes[item.id] && notes[item.id].rating || 0 })).sort((a, b) => String(b.visitDate).localeCompare(String(a.visitDate)))
    this.setData({ plans, timeline })
  },
  changePlanDate(e) {
    const dates = wx.getStorageSync('plannedScenicSpotDates') || {}
    dates[e.currentTarget.dataset.id] = e.detail.value
    wx.setStorageSync('plannedScenicSpotDates', dates)
    this.refresh()
  },
  stopTap() {},
  chooseProvince(e) { this.setData({ provinceIndex: Number(e.detail.value) }) },
  chooseDays(e) { this.setData({ dayIndex: Number(e.detail.value) }) },
  choosePreference(e) { this.setData({ preferenceIndex: Number(e.detail.value) }) },
  generateItinerary() {
    const province = this.data.provinces[this.data.provinceIndex]
    const preference = this.data.preferences[this.data.preferenceIndex]
    const count = (this.data.dayIndex + 1) * 2
    let candidates = all.filter(item => province === '全部' || item.province === province)
    if (preference === '历史人文') candidates = candidates.filter(item => /故宫|古|博物|文化|遗址|寺|陵|城|纪念/.test(item.name)).concat(candidates)
    if (preference === '自然风光') candidates = candidates.filter(item => /山|湖|河|海|瀑布|森林|峡谷|草原|泉/.test(item.name)).concat(candidates)
    candidates = candidates.filter((item, index, list) => list.findIndex(other => other.id === item.id) === index).sort((a, b) => ({'5A':0,'4A':1,'3A':2,'地标':3}[a.grade] || 4) - ({'5A':0,'4A':1,'3A':2,'地标':3}[b.grade] || 4))
    const chosen = candidates.slice(0, count).map(travel.enrich)
    const itinerary = Array.from({ length: this.data.dayIndex + 1 }, (_, day) => ({ day: day + 1, spots: chosen.slice(day * 2, day * 2 + 2) })).filter(item => item.spots.length)
    this.setData({ itinerary })
    if (!itinerary.length) wx.showToast({ title: '当前条件没有可用景区', icon: 'none' })
  },
  selectRandomGrade(e) { this.setData({ randomGrade: e.currentTarget.dataset.grade }) },
  randomize() {
    const candidates = all.filter(item => this.data.randomGrade === '全部' || item.grade === this.data.randomGrade)
    if (!candidates.length) return
    const spot = candidates[Math.floor(Math.random() * candidates.length)]
    this.setData({ randomSpot: travel.enrich(spot) })
  },
  openDetail(e) { const spot = all.find(item => item.id === e.currentTarget.dataset.id); if (spot) wx.navigateTo({ url: travel.detailUrl(spot) }) }
})
