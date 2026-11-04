const travel = require('../../utils/travel')
const PHOTO_CACHE_KEY = 'scenicPhotoCacheV1'

const plainText = value => String(value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
const normalizeText = value => String(value || '').toLowerCase().replace(/[\s·—－/（）()、,，.。]/g, '').replace(/国家级?|旅游|风景|名胜|景区|公园/g, '')
Page({
  data: { spot: null, heroPhotos: [], currentHeroIndex: 0, coverLoading: false, favorite: false, planned: false, lit: false, scrollProgress: 0, showBackTop: false, feedbackOpen: false, feedbackText: '', guideExpanded: false, guideSize: 'medium', guideSizes: [{ key: 'small', label: '小' }, { key: 'medium', label: '中' }, { key: 'large', label: '大' }], routeMode: '经典', routeModes: ['经典', '轻松', '亲子'], noteText: '', noteRating: 0, noteSaved: false, ratings: [1, 2, 3, 4, 5] },
  onLoad(options) {
    this.grade = options.grade
    this.sourceId = options.id
    const spot = travel.getSpot(options.grade, options.id)
    if (!spot) { wx.showToast({ title: '景区信息不存在', icon: 'none' }); setTimeout(() => wx.navigateBack(), 700); return }
    const heroPhotos = [{ src: spot.cover, title: spot.name, credit: '景区实景图' }, ...spot.guidePhotos]
      .filter((item, index, list) => item && item.src && list.findIndex(photo => photo && photo.src === item.src) === index)
      .slice(0, 3)
      .map(item => ({ ...item, loaded: false, error: false }))
    const guideLength = (spot.guideSections || []).reduce((total, section) => total + String(section.text || '').length, 0)
    spot.guideExpandable = guideLength > 250
    spot.tags = travel.tagsFor(spot)
    const recent = wx.getStorageSync('recentScenicSpotsV1') || []
    wx.setStorageSync('recentScenicSpotsV1', [{ id: spot.id, name: spot.name, province: spot.province, grade: options.grade, sourceId: options.id, visitedAt: Date.now() }, ...recent.filter(item => item.id !== spot.id)].slice(0, 12))
    this.setData({ spot, heroPhotos, coverLoading: !heroPhotos.length })
    if (!heroPhotos.length) this.searchCover(spot, false)
    this.savedScrollTop = wx.getStorageSync(`detailScrollV1:${spot.id}`) || 0
  },
  onReady() { if (this.savedScrollTop > 40) setTimeout(() => wx.pageScrollTo({ scrollTop: this.savedScrollTop, duration: 0 }), 80) },
  onPageScroll(e) {
    this.lastScrollTop = e.scrollTop
    wx.createSelectorQuery().select('.page').boundingClientRect(rect => {
      if (!rect) return
      const total = Math.max(1, rect.height - (wx.getSystemInfoSync().windowHeight || 700))
      this.setData({ scrollProgress: Math.min(100, Math.round(e.scrollTop / total * 100)), showBackTop: e.scrollTop > 700 })
    }).exec()
    clearTimeout(this.scrollTimer); this.scrollTimer = setTimeout(() => this.saveReadingPosition(), 250)
  },
  onShow() {
    if (!this.data.spot) return
    const id = this.data.spot.id
    const notes = wx.getStorageSync('travelNotesV1') || {}
    const note = notes[id] || {}
    this.setData({ favorite: travel.storageList('favoriteScenicSpotIds').includes(id), planned: travel.storageList('plannedScenicSpotIds').includes(id), lit: travel.storageList('litScenicSpotIds').includes(id), noteText: note.text || '', noteRating: note.rating || 0, noteSaved: !!note.text })
  },
  goBack() { wx.navigateBack() },
  copySpotName() { wx.setClipboardData({ data: this.data.spot.name }) },
  backToTop() { wx.pageScrollTo({ scrollTop: 0, duration: 420 }) },
  randomSpot() {
    const candidates = travel.allSpots().filter(item => item.id !== this.data.spot.id)
    const spot = candidates[Math.floor(Math.random() * candidates.length)]
    if (spot) wx.redirectTo({ url: travel.detailUrl(spot) })
  },
  toggleFavorite() { const value = travel.toggleStored('favoriteScenicSpotIds', this.data.spot.id); this.setData({ favorite: value }); wx.showToast({ title: value ? '已收藏' : '已取消收藏', icon: 'none' }) },
  togglePlan() { const value = travel.toggleStored('plannedScenicSpotIds', this.data.spot.id); this.setData({ planned: value }); wx.showToast({ title: value ? '已加入游览清单' : '已移出游览清单', icon: 'none' }) },
  toggleLit() {
    const value = travel.toggleStored('litScenicSpotIds', this.data.spot.id)
    const dates = wx.getStorageSync('litScenicSpotDates') || {}
    if (value) dates[this.data.spot.id] = new Date().toISOString().slice(0, 10); else delete dates[this.data.spot.id]
    wx.setStorageSync('litScenicSpotDates', dates)
    this.setData({ lit: value }); wx.showToast({ title: value ? '足迹已点亮' : '已取消点亮', icon: 'none' })
  },
  selectRoute(e) { this.setData({ routeMode: e.currentTarget.dataset.mode }) },
  toggleGuide() { this.setData({ guideExpanded: !this.data.guideExpanded }) },
  selectGuideSize(e) { this.setData({ guideSize: e.currentTarget.dataset.size }) },
  openFeedback() { this.setData({ feedbackOpen: true, feedbackText: '' }) },
  closeFeedback() { this.setData({ feedbackOpen: false }) },
  stopFeedbackTap() {},
  inputFeedback(e) { this.setData({ feedbackText: e.detail.value }) },
  submitFeedback() {
    const text = this.data.feedbackText.trim()
    if (!text) { wx.showToast({ title: '请填写需要纠正的内容', icon: 'none' }); return }
    const feedback = wx.getStorageSync('scenicContentFeedbackV1') || []
    feedback.unshift({ spotId: this.data.spot.id, spotName: this.data.spot.name, text, createdAt: new Date().toISOString() })
    wx.setStorageSync('scenicContentFeedbackV1', feedback.slice(0, 100))
    this.setData({ feedbackOpen: false, feedbackText: '' }); wx.showToast({ title: '反馈已记录', icon: 'success' })
  },
  saveReadingPosition() { if (this.data.spot && Number.isFinite(this.lastScrollTop)) wx.setStorageSync(`detailScrollV1:${this.data.spot.id}`, this.lastScrollTop) },
  inputNote(e) { this.setData({ noteText: e.detail.value, noteSaved: false }) },
  selectRating(e) { this.setData({ noteRating: Number(e.currentTarget.dataset.rating), noteSaved: false }) },
  saveNote() {
    const text = this.data.noteText.trim()
    if (!text && !this.data.noteRating) { wx.showToast({ title: '写点旅行感受或选择评分', icon: 'none' }); return }
    const notes = wx.getStorageSync('travelNotesV1') || {}
    notes[this.data.spot.id] = { text, rating: this.data.noteRating, updatedAt: new Date().toISOString() }
    wx.setStorageSync('travelNotesV1', notes)
    this.setData({ noteText: text, noteSaved: true })
    wx.showToast({ title: '旅行笔记已保存', icon: 'success' })
  },
  deleteNote() {
    const notes = wx.getStorageSync('travelNotesV1') || {}
    delete notes[this.data.spot.id]
    wx.setStorageSync('travelNotesV1', notes)
    this.setData({ noteText: '', noteRating: 0, noteSaved: false })
  },
  previewCover() {
    const photos = this.data.heroPhotos.filter(item => !item.error)
    if (!photos.length) return
    const current = this.data.heroPhotos[this.data.currentHeroIndex]
    wx.previewImage({ current: current && current.src, urls: photos.map(item => item.src) })
  },
  onHeroChange(e) { this.setData({ currentHeroIndex: e.detail.current }) },
  heroImageLoaded(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ [`heroPhotos[${index}].loaded`]: true, coverLoading: false })
  },
  heroImageError(e) {
    const index = Number(e.currentTarget.dataset.index)
    const updates = { [`heroPhotos[${index}].error`]: true }
    const next = this.data.heroPhotos.findIndex((item, photoIndex) => photoIndex !== index && !item.error)
    if (this.data.currentHeroIndex === index && next >= 0) updates.currentHeroIndex = next
    this.setData(updates)
    const available = this.data.heroPhotos.some((item, photoIndex) => photoIndex !== index && !item.error)
    if (!available && !this.remoteCoverRequested) this.searchCover(this.data.spot, false)
  },
  showCurrentPhotoSource() {
    const photo = this.data.heroPhotos[this.data.currentHeroIndex]
    if (!photo) return
    const content = [photo.credit || '景区实景图', photo.licenseUrl || ''].filter(Boolean).join('\n')
    wx.showModal({ title: '图片来源与许可', content, confirmText: photo.sourceUrl ? '复制来源' : '知道了', showCancel: !!photo.sourceUrl, success: result => { if (result.confirm && photo.sourceUrl) wx.setClipboardData({ data: photo.sourceUrl }) } })
  },
  reportCurrentPhoto() {
    const photo = this.data.heroPhotos[this.data.currentHeroIndex]
    if (!photo) return
    wx.showActionSheet({
      itemList: ['图片不是该景区', '图片质量较差', '图片内容不适合'],
      success: result => {
        const feedback = wx.getStorageSync('scenicPhotoFeedbackV1') || []
        feedback.unshift({ spotId: this.data.spot.id, spotName: this.data.spot.name, imageUrl: photo.src, reason: ['图片不是该景区', '图片质量较差', '图片内容不适合'][result.tapIndex], createdAt: new Date().toISOString() })
        wx.setStorageSync('scenicPhotoFeedbackV1', feedback.slice(0, 100))
        wx.showToast({ title: '图片反馈已记录', icon: 'success' })
      }
    })
  },
  searchCover(spot, nameOnly) {
    if (!spot || this.coverRequest) return
    this.remoteCoverRequested = true
    this.setData({ coverLoading: true })
    const queryName = nameOnly ? normalizeText(spot.name) : spot.name
    this.coverRequest = wx.request({
      url: 'https://commons.wikimedia.org/w/api.php',
      timeout: 9000,
      data: { action: 'query', generator: 'search', gsrsearch: `"${queryName}"${nameOnly ? '' : ` ${spot.province}`}`, gsrnamespace: 6, gsrlimit: 10, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: 1280, format: 'json' },
      success: response => {
        this.coverRequest = null
        const pages = response.data && response.data.query && response.data.query.pages || {}
        const spotKey = normalizeText(spot.name)
        const images = Object.keys(pages).map(key => {
          const page = pages[key]
          const info = page.imageinfo && page.imageinfo[0]
          if (!info || !info.thumburl || !/\.(jpe?g|png|webp)(\?|$)/i.test(info.thumburl)) return null
          const meta = info.extmetadata || {}
          const description = plainText(meta.ImageDescription && meta.ImageDescription.value)
          const sourceText = normalizeText(`${page.title} ${description}`)
          if (spotKey && !sourceText.includes(spotKey) && !spotKey.includes(normalizeText(page.title.replace(/^File:/i, '')))) return null
          return { src: info.thumburl, title: spot.name, credit: [plainText(meta.Artist && meta.Artist.value), plainText(meta.LicenseShortName && meta.LicenseShortName.value)].filter(Boolean).join(' · ') || 'Wikimedia Commons', sourceUrl: info.descriptionurl || '', licenseUrl: meta.LicenseUrl && meta.LicenseUrl.value || '' }
        }).filter(Boolean).filter((image, index, list) => list.findIndex(item => item.src === image.src) === index).slice(0, 3)
        if (!images.length && !nameOnly) {
          this.searchCover(spot, true)
          return
        }
        if (!images.length) {
          this.setData({ coverLoading: false })
          return
        }
        try {
          const cache = wx.getStorageSync(PHOTO_CACHE_KEY) || {}
          cache[spot.id] = images
          const keys = Object.keys(cache)
          keys.slice(0, Math.max(0, keys.length - 240)).forEach(key => delete cache[key])
          wx.setStorageSync(PHOTO_CACHE_KEY, cache)
        } catch (error) { /* 缓存不可用时仍展示本次图片。 */ }
        this.setData({
          'spot.cover': images[0].src,
          'spot.guidePhotos': images.slice(0, 2),
          heroPhotos: images.map(item => ({ ...item, loaded: false, error: false })),
          currentHeroIndex: 0
        })
      },
      fail: () => {
        this.coverRequest = null
        if (!nameOnly) this.searchCover(spot, true)
        else this.setData({ coverLoading: false })
      }
    })
  },
  onShareAppMessage() { return { title: `我发现了${this.data.spot.name}，一起去看看`, path: travel.detailUrl(this.data.spot), imageUrl: this.data.spot.cover || '' } },
  onUnload() {
    clearTimeout(this.scrollTimer)
    if (this.coverRequest) this.coverRequest.abort()
    this.saveReadingPosition()
  }
})
