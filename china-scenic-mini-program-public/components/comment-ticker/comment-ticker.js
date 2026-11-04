const STORAGE_KEY = 'scenicCommentsV1'
const MAX_COMMENTS = 30

Component({
  properties: {
    spotId: { type: String, value: '', observer: 'loadComments' },
    spotName: { type: String, value: '' }
  },
  data: { comments: [], tickerComments: [], draft: '', expanded: false },
  lifetimes: { attached() { this.loadComments() } },
  methods: {
    loadComments() {
      if (!this.properties.spotId) return
      const store = wx.getStorageSync(STORAGE_KEY) || {}
      const comments = Array.isArray(store[this.properties.spotId]) ? store[this.properties.spotId] : []
      this.setData({ comments, tickerComments: this.buildTicker(comments) })
    },
    buildTicker(comments) {
      if (!comments.length) return []
      if (comments.length === 1) return comments.concat(comments, comments)
      if (comments.length === 2) return comments.concat(comments)
      return comments
    },
    toggleEditor() { this.setData({ expanded: !this.data.expanded }) },
    inputDraft(e) { this.setData({ draft: e.detail.value }) },
    submitComment() {
      const text = this.data.draft.replace(/\s+/g, ' ').trim()
      if (!text) { wx.showToast({ title: '请输入评论内容', icon: 'none' }); return }
      const comment = { id: `${Date.now()}`, text, createdAt: Date.now() }
      const comments = [comment].concat(this.data.comments).slice(0, MAX_COMMENTS)
      const store = wx.getStorageSync(STORAGE_KEY) || {}
      store[this.properties.spotId] = comments
      wx.setStorageSync(STORAGE_KEY, store)
      this.setData({ comments, tickerComments: this.buildTicker(comments), draft: '', expanded: false })
      wx.showToast({ title: '评论已显示', icon: 'success' })
    },
    deleteComment(e) {
      const id = e.currentTarget.dataset.id
      const comments = this.data.comments.filter(item => item.id !== id)
      const store = wx.getStorageSync(STORAGE_KEY) || {}
      store[this.properties.spotId] = comments
      wx.setStorageSync(STORAGE_KEY, store)
      this.setData({ comments, tickerComments: this.buildTicker(comments) })
    }
  }
})
