const fiveA = require('../../data/attractions5a')
const fourA = require('../../data/attractions4a')
const threeA = require('../../data/attractions3a')
const landmarkData = require('../../data/landmarks')
const scenicPhotos = require('../../data/scenic-photos')
const PHOTO_CACHE_KEY = 'scenicPhotoCacheV1'
const localLandmarkPhotos = {
  'beijing-tiananmen': ['tiananmen-1', 'tiananmen-2'],
  'zhejiang-west-lake': ['westlake-1', 'westlake-2'],
  'anhui-huangshan': ['huangshan-1', 'huangshan-2'],
  'shandong-mount-tai': ['taishan-1', 'taishan-2'],
  'sichuan-jiuzhaigou': ['jiuzhaigou-1', 'jiuzhaigou-2'],
  'shaanxi-terracotta-army': ['terracotta-1', 'terracotta-2']
}
const localCredits = {
  tiananmen: ['Charlie fong · 公有领域', 'TarnishedPath · CC BY-SA 4.0'],
  westlake: ['Jakub Hałun · CC BY-SA 3.0', 'Louisa Salazar · CC BY-SA 3.0'],
  huangshan: ['Chi King · CC BY 2.0', 'Chi King · CC BY 2.0'],
  taishan: ['Rolf Müller · CC BY-SA 3.0', 'Rolf Müller · CC BY-SA 3.0'],
  jiuzhaigou: ['Chensiyuan · CC BY-SA 4.0', 'CEphoto, Uwe Aranas · CC BY-SA 3.0'],
  terracotta: ['CEphoto, Uwe Aranas · CC BY-SA 3.0', 'CEphoto, Uwe Aranas · CC BY-SA 3.0']
}
const plainText = value => String(value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
const addSourceIds = items => items.map((item, sourceId) => ({
  ...item,
  sourceId,
  sourceGrade: item.grade
}))
const landmarkSpots = landmarkData.map(item => ({ ...item, grade: '地标', sourceId: item.id, sourceGrade: 'landmark' }))
const attractions = addSourceIds(fiveA).concat(addSourceIds(fourA), addSourceIds(threeA)).map((item, index) => ({
  ...item,
  id: `spot-${index}`,
  summary: item.description || `${item.name}位于${item.province}${item.city || ''}，是一处适合了解当地自然与人文特色的${item.grade}级景区。`
})).concat(landmarkSpots.map(item => ({
  ...item,
  summary: item.description || `${item.name}是${item.province}${item.city || ''}具有代表性的城市地标。`
})))
const PAGE_SIZE = 20
const SEARCH_ALIASES = { 故宫: '故宫博物院', 兵马俑: '秦始皇兵马俑', 张家界国家森林公园: '张家界武陵源', 黄山: '黄山风景区', 西湖: '杭州西湖', 天安门广场: '天安门' }
const normalizeText = value => String(value || '').toLowerCase().replace(/[\s·—－/（）()、,，.。]/g, '').replace(/国家级?|旅游|风景|名胜|景区/g, '')
const photoKeyFor = spot => spot.grade === '地标' ? spot.id : `${spot.sourceGrade || spot.grade}-${spot.sourceId}`
const localCoverFor = spot => {
  const local = localLandmarkPhotos[spot.id]
  if (local && local[0]) return `/assets/map-previews/${local[0]}.jpg`
  const image = scenicPhotos[photoKeyFor(spot)] && scenicPhotos[photoKeyFor(spot)][0]
  return image && image.src || ''
}

Page({
  data: {
    keyword: '',
    provinces: ['全部', ...Array.from(new Set(attractions.map(item => item.province)))],
    activeProvince: '全部',
    grades: ['全部', '5A', '4A', '3A', '地标'],
    activeGrade: '全部',
    fiveACount: fiveA.length,
    fourACount: fourA.length,
    threeACount: threeA.length,
    landmarkCount: landmarkSpots.length,
    total: attractions.length,
    resultCount: attractions.length,
    visibleSpots: [],
    hasMore: false,
    photoPreview: null,
    recentSpots: []
  },
  onLoad() { this.cardPhotoRequests = []; this.updateResults() },
  onShow() { this.setData({ recentSpots: (wx.getStorageSync('recentScenicSpotsV1') || []).slice(0, 6) }) },
  clearRecent() { wx.removeStorageSync('recentScenicSpotsV1'); this.setData({ recentSpots: [] }) },
  openRecent(e) { const item = this.data.recentSpots[e.currentTarget.dataset.index]; if (item) wx.navigateTo({ url: `/pages/detail/detail?grade=${item.grade}&id=${item.sourceId}` }) },
  goBack() {
    if (this.returningHome) return
    this.returningHome = true
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({ url: '/pages/index/index' })
      }
    })
  },
  onSearch(e) {
    this.setData({ keyword: e.detail.value })
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => this.updateResults(), 180)
  },
  clearSearch() { this.setData({ keyword: '' }, () => this.updateResults()) },
  openLandmarkPhotos(e) {
    const spot = landmarkSpots.find(item => item.id === e.currentTarget.dataset.id)
    if (!spot) return
    this.cancelPhotoRequest()
    const token = this.photoToken
    const local = localLandmarkPhotos[spot.id]
    let images = local ? local.map((file, index) => ({ src: `/assets/map-previews/${file}.jpg`, title: spot.name, credit: localCredits[file.replace(/-\d+$/, '')][index] })) : []
    if (!images.length) {
      const existing = attractions.find(item => item.grade !== '地标' && item.province === spot.province && normalizeText(item.name) === normalizeText(spot.name))
      if (existing) images = scenicPhotos[`${existing.grade}-${existing.sourceId}`] || []
    }
    if (!images.length) {
      const cache = wx.getStorageSync(PHOTO_CACHE_KEY) || {}
      images = Array.isArray(cache[spot.id]) ? cache[spot.id] : []
    }
    this.setData({ photoPreview: { id: spot.id, name: spot.name, province: spot.province, loading: !images.length, images: images.map(image => ({ ...image, loaded: false, error: false })) } })
    if (!images.length) this.searchLandmarkPhotos(spot, token, false)
  },
  searchLandmarkPhotos(spot, token, nameOnly) {
    if (this.photoToken !== token) return
    this.photoRequest = wx.request({
      url: 'https://commons.wikimedia.org/w/api.php',
      timeout: 8000,
      data: { action: 'query', generator: 'search', gsrsearch: `"${spot.name}"${nameOnly ? '' : ` ${spot.province}`}`, gsrnamespace: 6, gsrlimit: 8, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: 960, format: 'json' },
      success: response => {
        if (this.photoToken !== token) return
        const pages = response.data && response.data.query && response.data.query.pages || {}
        const images = Object.keys(pages).map(key => {
          const page = pages[key]
          const info = page.imageinfo && page.imageinfo[0]
          if (!info || !info.thumburl || !/\.(jpe?g|png|webp)(\?|$)/i.test(info.thumburl)) return null
          const meta = info.extmetadata || {}
          const description = plainText(meta.ImageDescription && meta.ImageDescription.value)
          if (!normalizeText(`${page.title} ${description}`).includes(normalizeText(spot.name))) return null
          return { src: info.thumburl, title: spot.name, credit: [plainText(meta.Artist && meta.Artist.value), plainText(meta.LicenseShortName && meta.LicenseShortName.value)].filter(Boolean).join(' · ') || 'Wikimedia Commons', sourceUrl: info.descriptionurl || '', licenseUrl: meta.LicenseUrl && meta.LicenseUrl.value || '' }
        }).filter(Boolean).filter((image, index, list) => list.findIndex(item => item.src === image.src) === index).slice(0, 2)
        if (!images.length && !nameOnly) { this.searchLandmarkPhotos(spot, token, true); return }
        if (images.length) {
          try {
            const cache = wx.getStorageSync(PHOTO_CACHE_KEY) || {}
            cache[spot.id] = images
            Object.keys(cache).slice(0, Math.max(0, Object.keys(cache).length - 240)).forEach(key => delete cache[key])
            wx.setStorageSync(PHOTO_CACHE_KEY, cache)
          } catch (error) { /* 缓存不可用时仍展示本次图片。 */ }
        }
        this.finishLandmarkPhotos(token, images)
      },
      fail: () => this.finishLandmarkPhotos(token, [], true)
    })
  },
  finishLandmarkPhotos(token, images, failed = false) {
    if (this.photoToken !== token || !this.data.photoPreview) return
    this.setData({ 'photoPreview.loading': false, 'photoPreview.failed': failed, 'photoPreview.images': images.map(image => ({ ...image, loaded: false, error: false })) })
  },
  onLandmarkImageLoad(e) { this.setLandmarkImageState(e, false) },
  onLandmarkImageError(e) { this.setLandmarkImageState(e, true) },
  setLandmarkImageState(e, error) {
    const { id, index } = e.currentTarget.dataset
    if (!this.data.photoPreview || this.data.photoPreview.id !== id || !this.data.photoPreview.images[index]) return
    this.setData({ [`photoPreview.images[${index}].loaded`]: !error, [`photoPreview.images[${index}].error`]: error })
  },
  retryLandmarkPhotos() {
    if (!this.data.photoPreview) return
    this.openLandmarkPhotos({ currentTarget: { dataset: { id: this.data.photoPreview.id } } })
  },
  showLandmarkSource(e) {
    const preview = this.data.photoPreview
    const image = preview && preview.images[e.currentTarget.dataset.index]
    if (!image || !image.sourceUrl) return
    wx.showModal({ title: '图片来源与许可', content: `${image.credit}\n${image.licenseUrl || ''}`, confirmText: '复制来源', success: result => { if (result.confirm) wx.setClipboardData({ data: image.sourceUrl }) } })
  },
  cancelPhotoRequest() {
    this.photoToken = (this.photoToken || 0) + 1
    if (this.photoRequest) this.photoRequest.abort()
    this.photoRequest = null
  },
  closeLandmarkPhotos() { this.cancelPhotoRequest(); this.setData({ photoPreview: null }) },
  stopPhotoTap() {},
  openDetail(e) {
    const { id, grade } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?grade=${grade}&id=${id}` })
  },
  openTravel() { wx.navigateTo({ url: '/pages/travel/travel' }) },
  selectProvince(e) { this.setData({ activeProvince: e.currentTarget.dataset.value }, () => this.updateResults()) },
  selectGrade(e) { this.setData({ activeGrade: e.currentTarget.dataset.value }, () => this.updateResults()) },
  updateResults() {
    const key = normalizeText(this.data.keyword)
    const expandedKey = normalizeText(SEARCH_ALIASES[this.data.keyword.trim()] || '')
    const cache = wx.getStorageSync(PHOTO_CACHE_KEY) || {}
    this.results = attractions.filter(item => (this.data.activeProvince === '全部' || item.province === this.data.activeProvince) && (this.data.activeGrade === '全部' || item.grade === this.data.activeGrade) && (!key || [key, expandedKey].filter(Boolean).some(term => normalizeText(`${item.name}${item.province}${item.city}${item.grade}${item.note || ''}`).includes(term)))).map(item => {
      const photoKey = photoKeyFor(item)
      const cached = cache[photoKey] && cache[photoKey][0]
      return { ...item, photoKey, cover: localCoverFor(item) || cached && cached.src || '', coverLoaded: false, coverError: false, photoLookupDone: false }
    })
    const visibleSpots = this.results.slice(0, PAGE_SIZE)
    this.setData({ resultCount: this.results.length, visibleSpots, hasMore: this.results.length > PAGE_SIZE }, () => this.preloadCardPhotos(visibleSpots))
  },
  loadMore() {
    if (!this.data.hasMore) return
    const start = this.data.visibleSpots.length
    const next = this.results.slice(start, start + PAGE_SIZE)
    const updates = { hasMore: this.results.length > start + next.length }
    next.forEach((item, index) => { updates[`visibleSpots[${start + index}]`] = item })
    this.setData(updates, () => this.preloadCardPhotos(next))
  },
  preloadCardPhotos(spots) {
    this.cancelCardPhotoRequests()
    const token = this.cardPhotoToken
    spots.filter(item => !item.cover).slice(0, 4).forEach(item => this.requestCardPhoto(item, token))
  },
  requestCardPhoto(spot, token) {
    const request = wx.request({
      url: 'https://commons.wikimedia.org/w/api.php',
      timeout: 8000,
      data: { action: 'query', generator: 'search', gsrsearch: `"${spot.name}" ${spot.province}`, gsrnamespace: 6, gsrlimit: 6, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: 640, format: 'json' },
      success: response => {
        if (this.cardPhotoToken !== token) return
        const pages = response.data && response.data.query && response.data.query.pages || {}
        const spotKey = normalizeText(spot.name)
        const image = Object.keys(pages).map(key => {
          const page = pages[key]
          const info = page.imageinfo && page.imageinfo[0]
          const meta = info && info.extmetadata || {}
          if (!info || !info.thumburl || !/\.(jpe?g|png|webp)(\?|$)/i.test(info.thumburl)) return null
          if (!normalizeText(`${page.title} ${plainText(meta.ImageDescription && meta.ImageDescription.value)}`).includes(spotKey)) return null
          return { src: info.thumburl, title: spot.name, credit: [plainText(meta.Artist && meta.Artist.value), plainText(meta.LicenseShortName && meta.LicenseShortName.value)].filter(Boolean).join(' · ') || 'Wikimedia Commons', sourceUrl: info.descriptionurl || '', licenseUrl: meta.LicenseUrl && meta.LicenseUrl.value || '' }
        }).filter(Boolean)[0]
        if (!image) return
        try {
          const cache = wx.getStorageSync(PHOTO_CACHE_KEY) || {}
          cache[spot.photoKey] = [image]
          const keys = Object.keys(cache)
          keys.slice(0, Math.max(0, keys.length - 240)).forEach(key => delete cache[key])
          wx.setStorageSync(PHOTO_CACHE_KEY, cache)
        } catch (error) { /* 缓存失败不影响当前展示。 */ }
        const resultIndex = this.results.findIndex(item => item.photoKey === spot.photoKey)
        if (resultIndex >= 0) this.results[resultIndex] = { ...this.results[resultIndex], cover: image.src, photoLookupDone: true }
        const visibleIndex = this.data.visibleSpots.findIndex(item => item.photoKey === spot.photoKey)
        if (visibleIndex >= 0) this.setData({ [`visibleSpots[${visibleIndex}].cover`]: image.src, [`visibleSpots[${visibleIndex}].coverLoaded`]: false, [`visibleSpots[${visibleIndex}].coverError`]: false, [`visibleSpots[${visibleIndex}].photoLookupDone`]: true })
      }
    })
    this.cardPhotoRequests.push(request)
  },
  onCardImageLoad(e) {
    const index = this.data.visibleSpots.findIndex(item => item.photoKey === e.currentTarget.dataset.key)
    if (index >= 0) this.setData({ [`visibleSpots[${index}].coverLoaded`]: true })
  },
  onCardImageError(e) {
    const index = this.data.visibleSpots.findIndex(item => item.photoKey === e.currentTarget.dataset.key)
    if (index < 0) return
    const spot = this.data.visibleSpots[index]
    this.setData({ [`visibleSpots[${index}].coverError`]: true })
    if (!spot.photoLookupDone) this.requestCardPhoto({ ...spot, cover: '' }, this.cardPhotoToken)
  },
  cancelCardPhotoRequests() {
    this.cardPhotoToken = (this.cardPhotoToken || 0) + 1
    ;(this.cardPhotoRequests || []).forEach(request => request && request.abort && request.abort())
    this.cardPhotoRequests = []
  },
  onReachBottom() { this.loadMore() },
  onUnload() { clearTimeout(this.searchTimer); this.cancelPhotoRequest(); this.cancelCardPhotoRequests() }
})
