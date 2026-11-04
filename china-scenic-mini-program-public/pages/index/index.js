// index.js
const mapSpots = [
  { id: '5A-16', name: '故宫博物院', province: '北京', left: 57, top: 27, images: [{ src: '/assets/map-previews/forbidden-1.jpg', title: '故宫 · 太和殿前铜狮', credit: 'CEphoto, Uwe Aranas · CC BY-SA 3.0' }, { src: '/assets/map-previews/forbidden-2.jpg', title: '故宫 · 慈宁宫区域建筑', credit: 'Ermell · CC BY-SA 4.0' }] },
  { id: 'landmark-tiananmen', name: '天安门', province: '北京', left: 61, top: 25, images: [{ src: '/assets/map-previews/tiananmen-1.jpg', title: '天安门夜景', credit: 'Charlie fong · 公有领域' }, { src: '/assets/map-previews/tiananmen-2.jpg', title: '天安门广场', credit: 'TarnishedPath · CC BY-SA 4.0' }] },
  { id: '5A-102', name: '承德避暑山庄', province: '河北', left: 62, top: 31, images: [{ src: '/assets/map-previews/chengde-1.jpg', title: '承德避暑山庄', credit: 'takwing.kwong · CC BY-SA 2.0' }, { src: '/assets/map-previews/chengde-2.jpg', title: '避暑山庄湖区', credit: 'xiquinhosilva · CC BY 2.0' }] },
  { id: '5A-292', name: '五台山', province: '山西', left: 51, top: 35, images: [{ src: '/assets/map-previews/wutai-1.jpg', title: '五台山风光', credit: 'xiquinhosilva · CC BY 2.0' }, { src: '/assets/map-previews/wutai-2.jpg', title: '五台山风光', credit: 'xiquinhosilva · CC BY 2.0' }] },
  { id: '5A-5', name: '黄山', province: '安徽', left: 60, top: 52, images: [{ src: '/assets/map-previews/huangshan-1.jpg', title: '黄山峰林', credit: 'Chi King · CC BY 2.0' }, { src: '/assets/map-previews/huangshan-2.jpg', title: '黄山云雾与岩峰', credit: 'Chi King · CC BY 2.0' }] },
  { id: '5A-366', name: '西湖', province: '浙江', left: 66, top: 59, images: [{ src: '/assets/map-previews/westlake-1.jpg', title: '西湖日落与游船', credit: 'Jakub Hałun · CC BY-SA 3.0' }, { src: '/assets/map-previews/westlake-2.jpg', title: '西湖与雷峰塔', credit: 'Louisa Salazar · CC BY-SA 3.0' }] },
  { id: '5A-268', name: '泰山', province: '山东', left: 64, top: 42, images: [{ src: '/assets/map-previews/taishan-1.jpg', title: '泰山碧霞祠', credit: 'Rolf Müller · CC BY-SA 3.0' }, { src: '/assets/map-previews/taishan-2.jpg', title: '泰山登山石阶', credit: 'Rolf Müller · CC BY-SA 3.0' }] },
  { id: '5A-171', name: '张家界国家森林公园', province: '湖南', left: 51, top: 65, images: [{ src: '/assets/map-previews/zhangjiajie-1.jpg', title: '张家界国家森林公园峰林', credit: 'Kuruman · CC BY 2.0' }, { src: '/assets/map-previews/zhangjiajie-2.jpg', title: '张家界国家森林公园遥感影像', credit: 'Umbra Lab, Inc. · CC BY 4.0' }] },
  { id: '5A-343', name: '丽江古城', province: '云南', left: 31, top: 73, images: [{ src: '/assets/map-previews/lijiang-1.jpg', title: '丽江古城夜景', credit: 'Chensiyuan · CC BY-SA 4.0' }, { src: '/assets/map-previews/lijiang-2.jpg', title: '丽江古城水车', credit: 'CEphoto, Uwe Aranas · CC BY-SA 3.0' }] },
  { id: '5A-308', name: '九寨沟', province: '四川', left: 35, top: 51, images: [{ src: '/assets/map-previews/jiuzhaigou-1.jpg', title: '九寨沟五花海', credit: 'Chensiyuan · CC BY-SA 4.0' }, { src: '/assets/map-previews/jiuzhaigou-2.jpg', title: '九寨沟瀑布', credit: 'CEphoto, Uwe Aranas · CC BY-SA 3.0' }] },
  { id: '5A-256', name: '兵马俑', province: '陕西', left: 45, top: 48, images: [{ src: '/assets/map-previews/terracotta-1.jpg', title: '秦始皇兵马俑博物馆展厅', credit: 'CEphoto, Uwe Aranas · CC BY-SA 3.0' }, { src: '/assets/map-previews/terracotta-2.jpg', title: '秦始皇兵马俑与战车', credit: 'CEphoto, Uwe Aranas · CC BY-SA 3.0' }] }
]
const fiveA = require('../../data/attractions5a')
const fourA = require('../../data/attractions4a')
const threeA = require('../../data/attractions3a')
const scenicPhotos = require('../../data/scenic-photos')
const addIds = (spots, grade) => spots.map((spot, index) => ({ ...spot, id: `${grade}-${index}` }))
const allAttractions = addIds(fiveA, '5A').concat(addIds(fourA, '4A'), addIds(threeA, '3A'), {
  id: 'landmark-tiananmen',
  name: '天安门',
  province: '北京',
  city: '北京市',
  grade: '地标'
})
const RESULT_PAGE_SIZE = 30
const PHOTO_CACHE_KEY = 'scenicPhotoCacheV1'
const PHOTO_CACHE_LIMIT = 240
const SEARCH_ALIASES = {
  故宫: '故宫博物院',
  兵马俑: '秦始皇兵马俑',
  张家界国家森林公园: '张家界武陵源',
  黄山: '黄山风景区',
  西湖: '杭州西湖',
  天安门广场: '天安门'
}
const normalizeText = value => String(value || '').toLowerCase().replace(/[\s·—－/（）()、,，.。]/g, '').replace(/国家级?|旅游|风景|名胜|景区/g, '')
const plainText = value => String(value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
const formatVisitDate = date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const withPreviewImages = spot => {
  const matched = mapSpots.find(item => item.id === spot.id)
  const images = spot.images || (matched && matched.images) || scenicPhotos[spot.id] || []
  return { ...spot, images: images.map(image => ({ ...image, loaded: false, error: false })) }
}

Page({
  data: {
    openingVisible: true,
    openingReady: false,
    openingLeaving: false,
    onboardingVisible: false,
    onboardingStep: 0,
    onboardingSteps: [
      { index: '01', title: '发现景区', text: '在探索页搜索全国5A、4A、3A景区与各省地标。' },
      { index: '02', title: '点亮足迹', text: '在地图或景区详情页点亮到访地点，形成自己的旅行记录。' },
      { index: '03', title: '规划旅程', text: '收藏景区、加入清单，并在旅行中心查看路线和记录。' }
    ],
    monthlyGrade: '5A',
    currentPage: 0,
    mapSpots,
    mapPreview: null,
    previewReady: false,
    previewCelebrating: false,
    litCount: 0,
    litCountBump: false,
    justLitId: '',
    footprintsOpen: false,
    footprints: [],
    hasMoreFootprints: false,
    footprintProvinces: [],
    today: formatVisitDate(new Date()),
    grades: ['全部', '5A', '4A', '3A'],
    activeGrade: '全部',
    provinces: ['全部', ...Array.from(new Set(allAttractions.map(spot => spot.province)))],
    activeProvince: '全部',
    mapKeyword: '',
    resultCount: allAttractions.length,
    visibleAttractions: [],
    hasMoreAttractions: false,
    spots: [
      { name: '黄山', city: '安徽 · 黄山市', desc: '奇松、怪石与云海，写成一幅流动的山水长卷。', tag: '云海奇观', color: 'gold', index: '01' },
      { name: '故宫博物院', city: '北京 · 东城区', desc: '沿着红墙与宫门，听见六百年时光留下的回声。', tag: '历史人文', color: 'red', index: '02' },
      { name: '丽江古城', city: '云南 · 丽江市', desc: '水巷、石桥和木屋，把慢下来的日子留在这里。', tag: '古城漫游', color: 'teal', index: '03' },
      { name: '西湖', city: '浙江 · 杭州市', desc: '一湖烟雨，藏着杭州最温柔的四季。', tag: '湖光山色', color: 'blue', index: '04' }
    ]
  },

  onReady() {
    // 山河开场播放1.2秒，再留白0.3秒，最后浮现开始按钮。
    this.openingTimer = setTimeout(() => {
      this.setData({ openingReady: true })
    }, 1500)
  },

  enterHome() {
    if (!this.data.openingReady || this.data.openingLeaving) return
    this.setData({ openingLeaving: true })
    this.openingExitTimer = setTimeout(() => {
      const onboardingVisible = !wx.getStorageSync('travelOnboardingSeenV1')
      this.setData({ openingVisible: false, onboardingVisible })
    }, 500)
  },

  nextOnboarding() {
    if (this.data.onboardingStep >= this.data.onboardingSteps.length - 1) {
      this.finishOnboarding()
      return
    }
    this.setData({ onboardingStep: this.data.onboardingStep + 1 })
  },

  finishOnboarding() {
    wx.setStorageSync('travelOnboardingSeenV1', true)
    this.setData({ onboardingVisible: false })
  },

  onShow() {
    // 按北京时间自然月轮换，2026年10月从5A开始。
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
    const elapsedMonths = now.getUTCFullYear() * 12 + now.getUTCMonth() - (2026 * 12 + 9)
    const grades = ['5A', '4A', '3A']
    const savedIds = wx.getStorageSync('litScenicSpotIds') || []
    const legacyNames = wx.getStorageSync('litScenicSpots') || []
    const litIds = Array.from(new Set(savedIds.concat(legacyNames.map(name => {
      const spot = mapSpots.find(item => item.name === name || `${item.province}-${item.name}` === name)
      return spot && spot.id
    }).filter(Boolean))))
    if (litIds.join('|') !== savedIds.join('|')) wx.setStorageSync('litScenicSpotIds', litIds)
    this.setData({
      monthlyGrade: grades[((elapsedMonths % 3) + 3) % 3],
      mapSpots: mapSpots.map(spot => ({ ...spot, lit: litIds.includes(spot.id) })),
      litCount: litIds.length
    })
    this.refreshFootprints(litIds)
    if (!this.data.visibleAttractions.length) this.updateAttractionResults()
  },

  startExplore() {
    wx.navigateTo({ url: '/pages/explore/explore' })
  },
  openTravel() { wx.navigateTo({ url: '/pages/travel/travel' }) },
  openNearby() { wx.navigateTo({ url: '/pages/nearby/nearby' }) },

  changePage(e) {
    this.setData({ currentPage: e.detail.current })
  },

  openMapPreview(e) {
    const id = e.currentTarget.dataset.id
    const spot = this.data.mapSpots.find(item => item.id === id)
    if (!spot) return
    this.openPreviewSpot(spot)
  },

  openListedPreview(e) {
    const id = e.currentTarget.dataset.id
    const spot = this.data.visibleAttractions.find(item => item.id === id) || allAttractions.find(item => item.id === id)
    if (!spot) return
    this.openPreviewSpot(spot)
  },

  handleListedAction(e) {
    const id = e.currentTarget.dataset.id
    const spot = this.data.visibleAttractions.find(item => item.id === id) || allAttractions.find(item => item.id === id)
    if (!spot) return
    if (!spot.lit) {
      this.openPreviewSpot(spot)
      return
    }
    const lit = this.toggleLitSpot(id)
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    const visibleAttractions = this.data.visibleAttractions.map(item => item.id === id ? { ...item, lit } : item)
    const mapSpots = this.data.mapSpots.map(item => item.id === id ? { ...item, lit } : item)
    this.setData({ visibleAttractions, mapSpots, litCount: litIds.length })
    this.refreshFootprints(litIds)
    wx.showToast({ title: `已取消${spot.name}`, icon: 'none' })
  },

  openPreviewSpot(spot) {
    clearTimeout(this.previewTimer)
    clearTimeout(this.previewLoadTimer)
    this.previewLoadedSrcs = new Set()
    const mapPreview = withPreviewImages(spot)
    this.setData({ mapPreview: { ...mapPreview, photoSearching: !mapPreview.images.length }, previewReady: false, previewCelebrating: false })
    if (!mapPreview.images.length) {
      this.loadSpotPhotos(spot)
    } else {
      this.startPreviewLoadTimeout()
    }
  },

  loadSpotPhotos(spot, nameOnly = false) {
    const cache = wx.getStorageSync(PHOTO_CACHE_KEY) || {}
    if (Array.isArray(cache[spot.id]) && cache[spot.id].length) {
      this.applyLoadedSpotPhotos(spot.id, cache[spot.id])
      return
    }
    const location = [spot.province, spot.city].filter(Boolean).join(' ')
    wx.request({
      url: 'https://commons.wikimedia.org/w/api.php',
      timeout: 8000,
      data: {
        action: 'query',
        generator: 'search',
        gsrsearch: nameOnly ? `"${spot.name}"` : `"${spot.name}" ${location}`,
        gsrnamespace: 6,
        gsrlimit: 8,
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiurlwidth: 960,
        format: 'json'
      },
      success: response => {
        const pages = response.data && response.data.query && response.data.query.pages
        const photos = Object.keys(pages || {}).map(key => pages[key]).map(page => {
          const info = page.imageinfo && page.imageinfo[0]
          const meta = info && info.extmetadata || {}
          if (!info || !info.thumburl || !/\.(jpe?g|png|webp)(\?|$)/i.test(info.thumburl)) return null
          const description = plainText(meta.ImageDescription && meta.ImageDescription.value)
          const photoText = normalizeText(`${page.title} ${description}`)
          const name = normalizeText(spot.name)
          if (!name || !photoText.includes(name)) return null
          const author = plainText(meta.Artist && meta.Artist.value)
          const license = plainText(meta.LicenseShortName && meta.LicenseShortName.value)
          return {
            src: info.thumburl,
            title: spot.name,
            credit: [author, license].filter(Boolean).join(' · ') || 'Wikimedia Commons',
            sourceUrl: info.descriptionurl || '',
            licenseUrl: meta.LicenseUrl && meta.LicenseUrl.value || ''
          }
        }).filter(Boolean).filter((photo, index, list) => list.findIndex(item => item.src === photo.src) === index).slice(0, 2)
        if (!photos.length && !nameOnly) {
          this.loadSpotPhotos(spot, true)
          return
        }
        if (photos.length) {
          cache[spot.id] = photos
          const keys = Object.keys(cache)
          keys.slice(0, Math.max(0, keys.length - PHOTO_CACHE_LIMIT)).forEach(key => delete cache[key])
          wx.setStorageSync(PHOTO_CACHE_KEY, cache)
        }
        this.applyLoadedSpotPhotos(spot.id, photos)
      },
      fail: () => this.applyLoadedSpotPhotos(spot.id, [])
    })
  },

  applyLoadedSpotPhotos(spotId, photos) {
    if (!this.data.mapPreview || this.data.mapPreview.id !== spotId) return
    this.previewLoadedSrcs = new Set()
    const images = photos.map(image => ({ ...image, loaded: false, error: false }))
    this.setData({ 'mapPreview.images': images, 'mapPreview.photoSearching': false })
    if (images.length) {
      this.startPreviewLoadTimeout()
    } else {
      clearTimeout(this.previewTimer)
      this.previewTimer = setTimeout(() => this.setData({ previewReady: true }), 800)
    }
  },

  startPreviewLoadTimeout() {
    clearTimeout(this.previewLoadTimer)
    this.previewLoadTimer = setTimeout(() => {
      if (!this.data.mapPreview) return
      this.data.mapPreview.images.forEach((image, index) => {
        if (!this.previewLoadedSrcs.has(index)) this.finishPreviewImage(index, true)
      })
    }, 10000)
  },

  onPreviewImageLoaded(e) {
    if (!this.data.mapPreview || e.currentTarget.dataset.spotId !== this.data.mapPreview.id) return
    this.finishPreviewImage(Number(e.currentTarget.dataset.index), false)
  },

  onPreviewImageError(e) {
    if (!this.data.mapPreview || e.currentTarget.dataset.spotId !== this.data.mapPreview.id) return
    this.finishPreviewImage(Number(e.currentTarget.dataset.index), true)
  },

  finishPreviewImage(index, error) {
    if (!this.data.mapPreview || !this.data.mapPreview.images[index]) return
    this.previewLoadedSrcs.add(index)
    this.setData({
      [`mapPreview.images[${index}].loaded`]: !error,
      [`mapPreview.images[${index}].error`]: error
    })
    if (this.previewLoadedSrcs.size < this.data.mapPreview.images.length) return
    clearTimeout(this.previewLoadTimer)
    clearTimeout(this.previewTimer)
    this.previewTimer = setTimeout(() => this.setData({ previewReady: true }), 800)
  },

  retryPreviewImage(e) {
    const index = Number(e.currentTarget.dataset.index)
    if (!this.data.mapPreview || !this.data.mapPreview.images[index]) return
    this.previewLoadedSrcs.delete(index)
    clearTimeout(this.previewTimer)
    this.setData({
      previewReady: false,
      [`mapPreview.images[${index}].error`]: false,
      [`mapPreview.images[${index}].loaded`]: false
    })
    this.startPreviewLoadTimeout()
  },

  showPhotoSource(e) {
    const image = this.data.mapPreview && this.data.mapPreview.images[Number(e.currentTarget.dataset.index)]
    if (!image || !image.sourceUrl) return
    wx.showModal({
      title: '图片来源与许可',
      content: `${image.credit}\nWikimedia Commons\n${image.licenseUrl || ''}`,
      confirmText: '复制来源',
      success: result => {
        if (result.confirm) wx.setClipboardData({ data: image.sourceUrl })
      }
    })
  },

  closeMapPreview() {
    clearTimeout(this.previewTimer)
    clearTimeout(this.previewLoadTimer)
    this.setData({ mapPreview: null, previewReady: false })
  },

  lightPreviewSpot() {
    const spot = this.data.mapPreview
    if (!spot || !this.data.previewReady) return
    const lit = this.toggleLitSpot(spot.id)
    const mapSpots = this.data.mapSpots.map(item => item.id === spot.id ? { ...item, lit } : item)
    const visibleAttractions = this.data.visibleAttractions.map(item => item.id === spot.id ? { ...item, lit } : item)
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    this.setData({ mapSpots, visibleAttractions, mapPreview: { ...spot, lit }, litCount: litIds.length, previewCelebrating: lit })
    this.refreshFootprints(litIds)
    if (lit) this.triggerLitFeedback(spot.id)
    wx.showToast({ title: lit ? `已点亮${spot.name}` : `已取消${spot.name}`, icon: 'none' })
  },

  stopPreviewTap() {},

  toggleLitSpot(id) {
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    const index = litIds.indexOf(id)
    const lit = index === -1
    if (lit) litIds.push(id)
    else litIds.splice(index, 1)
    wx.setStorageSync('litScenicSpotIds', litIds)
    const dates = wx.getStorageSync('litScenicSpotDates') || {}
    if (lit) dates[id] = formatVisitDate(new Date())
    else delete dates[id]
    wx.setStorageSync('litScenicSpotDates', dates)
    return lit
  },

  refreshFootprints(litIds = wx.getStorageSync('litScenicSpotIds') || []) {
    const dates = wx.getStorageSync('litScenicSpotDates') || {}
    const footprints = litIds.map(id => allAttractions.find(spot => spot.id === id) || mapSpots.find(spot => spot.id === id)).filter(Boolean).map(spot => ({
      ...spot,
      visitDate: dates[spot.id] || '此前点亮'
    }))
    const counts = footprints.reduce((result, spot) => {
      result[spot.province] = (result[spot.province] || 0) + 1
      return result
    }, {})
    const footprintProvinces = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(name => ({ name, count: counts[name] }))
    this.footprintResults = footprints
    const limit = Math.max(RESULT_PAGE_SIZE, this.data.footprints.length)
    this.setData({ footprints: footprints.slice(0, limit), footprintProvinces, hasMoreFootprints: footprints.length > limit })
  },

  loadMoreFootprints() {
    const results = this.footprintResults || []
    const limit = this.data.footprints.length + RESULT_PAGE_SIZE
    this.setData({ footprints: results.slice(0, limit), hasMoreFootprints: results.length > limit })
  },

  toggleFootprints() {
    this.setData({ footprintsOpen: !this.data.footprintsOpen })
  },

  changeVisitDate(e) {
    const id = e.currentTarget.dataset.id
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    if (!litIds.includes(id)) return
    const dates = wx.getStorageSync('litScenicSpotDates') || {}
    dates[id] = e.detail.value
    wx.setStorageSync('litScenicSpotDates', dates)
    this.refreshFootprints(litIds)
  },

  cancelFootprint(e) {
    const id = e.currentTarget.dataset.id
    const spot = this.data.footprints.find(item => item.id === id)
    if (!spot) return
    const lit = this.toggleLitSpot(id)
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    this.setData({
      mapSpots: this.data.mapSpots.map(item => item.id === id ? { ...item, lit } : item),
      visibleAttractions: this.data.visibleAttractions.map(item => item.id === id ? { ...item, lit } : item),
      litCount: litIds.length
    })
    this.refreshFootprints(litIds)
    wx.showToast({ title: `已取消${spot.name}`, icon: 'none' })
  },

  triggerLitFeedback(id) {
    clearTimeout(this.feedbackTimer)
    this.setData({ justLitId: id, litCountBump: true })
    this.feedbackTimer = setTimeout(() => this.setData({ justLitId: '', litCountBump: false, previewCelebrating: false }), 900)
  },

  onMapSearch(e) {
    this.setData({ mapKeyword: e.detail.value })
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => this.updateAttractionResults(), 180)
  },

  clearMapSearch() {
    this.setData({ mapKeyword: '' }, () => this.updateAttractionResults())
  },

  selectMapGrade(e) {
    this.setData({ activeGrade: e.currentTarget.dataset.value }, () => this.updateAttractionResults())
  },

  selectMapProvince(e) {
    this.setData({ activeProvince: e.currentTarget.dataset.value }, () => this.updateAttractionResults())
  },

  updateAttractionResults() {
    const keyword = normalizeText(this.data.mapKeyword)
    const expandedKeyword = normalizeText(SEARCH_ALIASES[this.data.mapKeyword.trim()] || '')
    this.attractionResults = allAttractions.filter(spot =>
      (this.data.activeGrade === '全部' || spot.grade === this.data.activeGrade) &&
      (this.data.activeProvince === '全部' || spot.province === this.data.activeProvince) &&
      (!keyword || [keyword, expandedKeyword].filter(Boolean).some(term => normalizeText(`${spot.name}${spot.province}${spot.city}${spot.grade}${spot.note || ''}`).includes(term)))
    )
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    const visibleAttractions = this.attractionResults.slice(0, RESULT_PAGE_SIZE).map(spot => ({
      ...spot,
      lit: litIds.includes(spot.id)
    }))
    this.setData({
      resultCount: this.attractionResults.length,
      visibleAttractions,
      hasMoreAttractions: this.attractionResults.length > RESULT_PAGE_SIZE
    })
  },

  loadMoreAttractions() {
    if (!this.data.hasMoreAttractions) return
    const start = this.data.visibleAttractions.length
    const next = this.attractionResults.slice(start, start + RESULT_PAGE_SIZE)
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    const updates = { hasMoreAttractions: this.attractionResults.length > start + next.length }
    next.forEach((spot, index) => {
      updates[`visibleAttractions[${start + index}]`] = {
        ...spot,
        lit: litIds.includes(spot.id)
      }
    })
    this.setData(updates)
  },

  lightListedSpot(e) {
    const { id, name } = e.currentTarget.dataset
    const lit = this.toggleLitSpot(id)
    const litIds = wx.getStorageSync('litScenicSpotIds') || []
    const visibleAttractions = this.data.visibleAttractions.map(spot =>
      spot.id === id ? { ...spot, lit } : spot
    )
    const mapSpots = this.data.mapSpots.map(spot =>
      spot.id === id ? { ...spot, lit } : spot
    )
    this.setData({ visibleAttractions, mapSpots, litCount: litIds.length })
    this.refreshFootprints(litIds)
    if (lit) this.triggerLitFeedback(id)
    wx.showToast({ title: lit ? `已点亮${name}` : `已取消${name}`, icon: 'none' })
  },

  openSpot(e) {
    const ids = { '黄山': 5, '故宫博物院': 16, '丽江古城': 343, '西湖': 366 }
    const id = ids[e.currentTarget.dataset.name]
    if (typeof id === 'number') wx.navigateTo({ url: `/pages/detail/detail?grade=5A&id=${id}` })
  },

  onUnload() {
    clearTimeout(this.previewTimer)
    clearTimeout(this.previewLoadTimer)
    clearTimeout(this.openingTimer)
    clearTimeout(this.openingExitTimer)
    clearTimeout(this.searchTimer)
    clearTimeout(this.feedbackTimer)
  }
})
