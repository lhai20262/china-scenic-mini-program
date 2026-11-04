// pages/explore/explore.js
Page({
  data: {
    keyword: '',
    activeRegion: '全部',
    activeTheme: '全部',
    filteredSpots: [],
    regions: ['全部', '华东', '华北', '西南', '华南', '西北'],
    themes: ['全部', '山川', '人文', '古镇', '湖海'],
    spots: [
      { name: '黄山', city: '安徽 · 黄山市', region: '华东', theme: '山川', desc: '奇松、怪石与云海，写成一幅流动的山水长卷。', tag: '云海奇观', color: 'gold', index: '01' },
      { name: '故宫博物院', city: '北京 · 东城区', region: '华北', theme: '人文', desc: '沿着红墙与宫门，听见六百年时光留下的回声。', tag: '历史人文', color: 'red', index: '02' },
      { name: '丽江古城', city: '云南 · 丽江市', region: '西南', theme: '古镇', desc: '水巷、石桥和木屋，把慢下来的日子留在这里。', tag: '古城漫游', color: 'teal', index: '03' },
      { name: '西湖', city: '浙江 · 杭州市', region: '华东', theme: '湖海', desc: '一湖烟雨，藏着杭州最温柔的四季。', tag: '湖光山色', color: 'blue', index: '04' },
      { name: '外滩', city: '上海 · 黄浦区', region: '华东', theme: '人文', desc: '沿江而行，在万国建筑与浦东天际线之间读懂上海。', tag: '海派风华', color: 'gold', index: '05' },
      { name: '天津之眼', city: '天津 · 红桥区', region: '华北', theme: '人文', desc: '摩天轮跨越海河，把城市灯火收进缓慢上升的夜色。', tag: '海河夜景', color: 'red', index: '06' },
      { name: '承德避暑山庄', city: '河北 · 承德市', region: '华北', theme: '人文', desc: '园林与山水相依，留住清代皇家行宫的恢宏气韵。', tag: '皇家园林', color: 'teal', index: '07' },
      { name: '五台山', city: '山西 · 忻州市', region: '华北', theme: '山川', desc: '群峰环抱古刹，在晨钟暮鼓间感受清凉胜境。', tag: '佛国圣境', color: 'blue', index: '08' },
      { name: '呼伦贝尔草原', city: '内蒙古 · 呼伦贝尔市', region: '华北', theme: '山川', desc: '风吹草浪直抵天际，河流与牛羊铺展辽阔画卷。', tag: '草原牧歌', color: 'gold', index: '09' },
      { name: '沈阳故宫', city: '辽宁 · 沈阳市', region: '华北', theme: '人文', desc: '红墙黄瓦之间，珍藏着清初宫廷建筑的独特印记。', tag: '盛京遗韵', color: 'red', index: '10' },
      { name: '长白山', city: '吉林 · 延边州', region: '华北', theme: '山川', desc: '穿过原始森林，邂逅高山天池与四季变幻的云雾。', tag: '天池秘境', color: 'teal', index: '11' },
      { name: '冰雪大世界', city: '黑龙江 · 哈尔滨市', region: '华北', theme: '人文', desc: '晶莹城堡点亮寒夜，冰雪把北国冬天写成童话。', tag: '冰城奇境', color: 'blue', index: '12' },
      { name: '中山陵', city: '江苏 · 南京市', region: '华东', theme: '人文', desc: '沿石阶拾级而上，在苍松翠柏间回望近代风云。', tag: '金陵史迹', color: 'gold', index: '13' },
      { name: '鼓浪屿', city: '福建 · 厦门市', region: '华东', theme: '古镇', desc: '琴声、老别墅与海风交织，漫步一座没有车鸣的小岛。', tag: '海岛琴韵', color: 'red', index: '14' },
      { name: '庐山', city: '江西 · 九江市', region: '华东', theme: '山川', desc: '瀑布飞流、云雾漫山，诗意在层峦之间久久回荡。', tag: '匡庐奇秀', color: 'teal', index: '15' },
      { name: '泰山', city: '山东 · 泰安市', region: '华东', theme: '山川', desc: '登临五岳之首，在日出云海中感受千年文化积淀。', tag: '五岳独尊', color: 'blue', index: '16' },
      { name: '龙门石窟', city: '河南 · 洛阳市', region: '华北', theme: '人文', desc: '伊水两岸石壁千龛，凝固着跨越千年的雕刻艺术。', tag: '石刻瑰宝', color: 'gold', index: '17' },
      { name: '黄鹤楼', city: '湖北 · 武汉市', region: '华南', theme: '人文', desc: '登楼远眺长江，诗词里的千年名楼依旧气象万千。', tag: '江城名楼', color: 'red', index: '18' },
      { name: '张家界国家森林公园', city: '湖南 · 张家界市', region: '华南', theme: '山川', desc: '奇峰拔地、云雾穿行，仿佛走进一幅立体山水画。', tag: '峰林仙境', color: 'teal', index: '19' },
      { name: '丹霞山', city: '广东 · 韶关市', region: '华南', theme: '山川', desc: '赤壁丹崖层叠铺展，记录亿万年地貌演化的壮阔。', tag: '丹霞奇观', color: 'blue', index: '20' },
      { name: '漓江', city: '广西 · 桂林市', region: '华南', theme: '湖海', desc: '舟行碧水之间，两岸峰林倒映成最经典的桂林山水。', tag: '山水画廊', color: 'gold', index: '21' },
      { name: '蜈支洲岛', city: '海南 · 三亚市', region: '华南', theme: '湖海', desc: '清澈海水拥抱白色沙滩，热带海岛铺满明亮阳光。', tag: '海岛度假', color: 'red', index: '22' },
      { name: '洪崖洞', city: '重庆 · 渝中区', region: '西南', theme: '古镇', desc: '吊脚楼依山而建，在灯火与江风中展现山城层次。', tag: '山城夜色', color: 'teal', index: '23' },
      { name: '九寨沟', city: '四川 · 阿坝州', region: '西南', theme: '湖海', desc: '彩林倒映海子，瀑布与雪峰共同守护童话般的秘境。', tag: '彩林海子', color: 'blue', index: '24' },
      { name: '黄果树瀑布', city: '贵州 · 安顺市', region: '西南', theme: '山川', desc: '水流奔涌而下，轰鸣与水雾交织成磅礴自然乐章。', tag: '飞瀑奇观', color: 'gold', index: '25' },
      { name: '布达拉宫', city: '西藏 · 拉萨市', region: '西南', theme: '人文', desc: '宫堡依山而立，在高原阳光下诉说雪域文明的厚重。', tag: '雪域圣殿', color: 'red', index: '26' },
      { name: '兵马俑', city: '陕西 · 西安市', region: '西北', theme: '人文', desc: '千军列阵于地下，重现秦帝国跨越时空的恢宏气势。', tag: '大秦遗珍', color: 'teal', index: '27' },
      { name: '鸣沙山月牙泉', city: '甘肃 · 敦煌市', region: '西北', theme: '山川', desc: '沙山环抱一弯清泉，丝路风声仍在大漠深处回响。', tag: '大漠月泉', color: 'blue', index: '28' },
      { name: '青海湖', city: '青海 · 海北州', region: '西北', theme: '湖海', desc: '高原蓝湖铺向远方，油菜花与候鸟点亮辽阔天地。', tag: '高原蓝境', color: 'gold', index: '29' },
      { name: '沙坡头', city: '宁夏 · 中卫市', region: '西北', theme: '山川', desc: '黄河、大漠与绿洲相遇，展开西北独有的壮美景观。', tag: '黄河大漠', color: 'red', index: '30' },
      { name: '喀纳斯', city: '新疆 · 阿勒泰地区', region: '西北', theme: '湖海', desc: '森林环绕碧蓝湖泊，四季色彩在北疆山谷中流转。', tag: '北疆秘境', color: 'teal', index: '31' },
      { name: '日月潭', city: '台湾 · 南投县', region: '华南', theme: '湖海', desc: '湖面晨昏变幻，层山与薄雾勾勒宁静柔和的轮廓。', tag: '宝岛湖光', color: 'blue', index: '32' },
      { name: '维多利亚港', city: '香港 · 香港岛', region: '华南', theme: '湖海', desc: '海港两岸灯火璀璨，勾勒充满活力的都市天际线。', tag: '璀璨港湾', color: 'gold', index: '33' },
      { name: '大三巴牌坊', city: '澳门 · 花王堂区', region: '华南', theme: '人文', desc: '斑驳石壁融合东西文化，见证澳门数百年的城市记忆。', tag: '澳门地标', color: 'red', index: '34' }
    ]
  },

  goBack() { wx.navigateBack() },
  openSearch() { wx.navigateTo({ url: '/pages/search/search' }) },
  openSpot(e) {
    const spot = this.data.spots.find(item => item.name === e.currentTarget.dataset.name)
    const ids = { '黄山': 5, '故宫博物院': 16, '丽江古城': 343, '西湖': 366, '承德避暑山庄': 102, '五台山': 292, '泰山': 268, '张家界国家森林公园': 171, '九寨沟': 308, '兵马俑': 256 }
    const id = ids[e.currentTarget.dataset.name]
    if (!spot || typeof id !== 'number') return
    wx.navigateTo({ url: `/pages/detail/detail?grade=5A&id=${id}` })
  },
  openTravel() { wx.navigateTo({ url: '/pages/travel/travel' }) },
  openNearby() { wx.navigateTo({ url: '/pages/nearby/nearby' }) },

  onLoad() {
    const names = ['黄山', '故宫博物院', '丽江古城', '西湖', '承德避暑山庄', '五台山', '泰山', '张家界国家森林公园', '九寨沟', '兵马俑']
    this.setData({ spots: this.data.spots.filter(spot => names.includes(spot.name)) }, () => this.updateResults())
  },
  updateResults() {
    const { keyword, activeRegion, activeTheme, spots } = this.data
    const key = keyword.trim()
    const filteredSpots = spots.filter(spot => (!key || `${spot.name}${spot.city}${spot.desc}`.includes(key)) && (activeRegion === '全部' || spot.region === activeRegion) && (activeTheme === '全部' || spot.theme === activeTheme))
    this.setData({ filteredSpots })
  },
  onSearchInputAndUpdate(e) { this.setData({ keyword: e.detail.value }, () => this.updateResults()) },
  selectRegionAndUpdate(e) { this.setData({ activeRegion: e.currentTarget.dataset.value }, () => this.updateResults()) },
  selectThemeAndUpdate(e) { this.setData({ activeTheme: e.currentTarget.dataset.value }, () => this.updateResults()) },
  clearSearchAndUpdate() { this.setData({ keyword: '' }, () => this.updateResults()) },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
