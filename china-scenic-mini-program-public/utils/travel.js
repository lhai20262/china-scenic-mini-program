const fiveA = require('../data/attractions5a')
const fourA = require('../data/attractions4a')
const threeA = require('../data/attractions3a')
const landmarks = require('../data/landmarks')
const scenicPhotos = require('../data/scenic-photos')

const gradeData = { '5A': fiveA, '4A': fourA, '3A': threeA }
const featured = {
  '5A-5': { cover: '/assets/map-previews/huangshan-1.jpg', theme: '山川', months: [4, 5, 6, 9, 10, 11], duration: '1-2天', description: '奇松、怪石、云海与温泉共同构成黄山最具辨识度的自然景观。', route: ['云谷寺', '始信峰', '北海景区', '光明顶'] },
  '5A-16': { cover: '/assets/map-previews/forbidden-1.jpg', theme: '人文', months: [3, 4, 5, 9, 10, 11], duration: '半天', description: '沿中轴线穿行宫殿群，在建筑、陈设与院落之间了解明清宫廷历史。', route: ['午门', '太和殿', '乾清宫', '御花园'] },
  '5A-102': { cover: '/assets/map-previews/chengde-1.jpg', theme: '园林', months: [5, 6, 7, 8, 9], duration: '1天', description: '山水园林、宫殿建筑与外八庙共同呈现承德深厚的历史文化。', route: ['丽正门', '宫殿区', '湖泊区', '山区'] },
  '5A-171': { cover: '/assets/map-previews/zhangjiajie-1.jpg', theme: '山川', months: [4, 5, 9, 10, 11], duration: '2天', description: '石英砂岩峰林拔地而起，云雾、峡谷与森林形成层次丰富的自然景观。', route: ['金鞭溪', '袁家界', '天子山', '十里画廊'] },
  '5A-256': { cover: '/assets/map-previews/terracotta-1.jpg', theme: '人文', months: [3, 4, 5, 9, 10, 11], duration: '半天', description: '大型陶俑坑与出土文物集中展示秦代军阵、工艺与历史面貌。', route: ['一号坑', '三号坑', '二号坑', '文物陈列厅'] },
  '5A-268': { cover: '/assets/map-previews/taishan-1.jpg', theme: '山川', months: [4, 5, 6, 9, 10], duration: '1天', description: '登山古道、摩崖石刻和日出云海共同构成泰山独特的自然文化景观。', route: ['红门', '中天门', '十八盘', '南天门'] },
  '5A-292': { cover: '/assets/map-previews/wutai-1.jpg', theme: '人文', months: [5, 6, 7, 8, 9], duration: '1-2天', description: '群峰与古刹相映，是兼具高山风光与佛教文化的重要旅行目的地。', route: ['五爷庙', '塔院寺', '显通寺', '菩萨顶'] },
  '5A-308': { cover: '/assets/map-previews/jiuzhaigou-1.jpg', theme: '湖海', months: [5, 6, 9, 10], duration: '1-2天', description: '高山湖泊、瀑布和彩林组成九寨沟清澈而多变的自然景观。', route: ['树正沟', '日则沟', '则查洼沟', '诺日朗瀑布'] },
  '5A-343': { cover: '/assets/map-previews/lijiang-1.jpg', theme: '古城', months: [3, 4, 5, 9, 10, 11], duration: '1天', description: '古城街巷、流水石桥与纳西文化共同形成适合慢行体验的城市空间。', route: ['大水车', '四方街', '木府', '狮子山'] },
  '5A-366': { cover: '/assets/map-previews/westlake-1.jpg', theme: '湖海', months: [3, 4, 5, 9, 10, 11], duration: '1天', description: '湖岸、堤桥、园林与历史遗迹相连，适合步行、骑行或乘船游览。', route: ['断桥', '白堤', '苏堤', '雷峰塔'] }
}

const provinceCenters = {
  北京:[39.90,116.40],天津:[39.12,117.20],河北:[38.04,114.51],山西:[37.87,112.55],内蒙古:[40.84,111.75],辽宁:[41.80,123.43],吉林:[43.82,125.32],黑龙江:[45.80,126.53],上海:[31.23,121.47],江苏:[32.06,118.80],浙江:[30.27,120.15],安徽:[31.82,117.23],福建:[26.08,119.30],江西:[28.68,115.86],山东:[36.67,117.02],河南:[34.75,113.62],湖北:[30.59,114.30],湖南:[28.23,112.94],广东:[23.13,113.26],广西:[22.82,108.32],海南:[20.04,110.20],重庆:[29.56,106.55],四川:[30.57,104.07],贵州:[26.65,106.63],云南:[25.04,102.71],西藏:[29.65,91.12],陕西:[34.27,108.95],甘肃:[36.06,103.83],青海:[36.62,101.78],宁夏:[38.49,106.23],新疆:[43.82,87.62],台湾:[25.03,121.57],香港:[22.32,114.17],澳门:[22.20,113.54]
}

function allSpots() {
  const rated = Object.keys(gradeData).reduce((list, grade) => list.concat(gradeData[grade].map((spot, index) => ({ ...spot, grade, id: `${grade}-${index}`, sourceId: index }))), [])
  return rated.concat(landmarks.map(spot => ({ ...spot, grade: '地标', id: `landmark-${spot.id}`, sourceId: spot.id })))
}

function getSpot(grade, sourceId) {
  if (grade === 'landmark') {
    const spot = landmarks.find(item => item.id === sourceId)
    return spot && enrich({ ...spot, grade: '地标', id: `landmark-${spot.id}`, sourceId: spot.id })
  }
  const index = Number(sourceId)
  const spot = gradeData[grade] && gradeData[grade][index]
  return spot && enrich({ ...spot, grade, id: `${grade}-${index}`, sourceId: index })
}

function buildGuideSections(spot) {
  const place = `${spot.province || ''}${spot.city ? `·${spot.city}` : ''}`
  const gradeLabel = spot.grade === '地标' ? '城市地标' : `${spot.grade}旅游景区`
  const theme = spot.theme || '综合游览'
  const duration = spot.duration || '半天'
  const route = (spot.route || []).filter(Boolean)
  const routeText = route.length ? route.join('、') : '游客中心、核心景观区和休息服务区'
  return [
    {
      title: '景区概况',
      text: `${spot.name}位于${place || '中国'}，属于${gradeLabel}，以${theme}体验为主。游览时可先了解整体布局，再走近主要景观，留意自然环境、建筑空间与地方文化之间的联系。`
    },
    {
      title: '游览建议',
      text: `建议预留约${duration}，可参考“${routeText}”的顺序游览。途中适当放慢脚步，预留拍照和休息时间。出发前请查看预约、开放时间与天气信息，并准备舒适鞋履、饮用水及必要的防晒或雨具。`
    }
  ]
}

function enrich(spot) {
  const extra = featured[spot.id] || {}
  const cached = wx.getStorageSync('scenicPhotoCacheV1') || {}
  const photo = scenicPhotos[spot.id] && scenicPhotos[spot.id][0]
  const cachedPhoto = cached[spot.id] && cached[spot.id][0]
  const photos = (scenicPhotos[spot.id] || cached[spot.id] || []).filter(item => item && item.src).slice(0, 2)
  const cover = extra.cover || (photo && photo.src) || (cachedPhoto && cachedPhoto.src) || ''
  if (!photos.length && cover) photos.push({ src: cover, title: spot.name, credit: '景区实景图' })
  const month = new Date().getMonth() + 1
  const description = spot.description || extra.description || `${spot.name}位于${spot.province}${spot.city || ''}，适合结合当地文化、自然景观与城市生活安排游览。`
  const enrichedSpot = {
    ...spot,
    cover,
    theme: extra.theme || (spot.grade === '地标' ? '城市地标' : '综合游览'),
    duration: extra.duration || (spot.grade === '5A' ? '1天' : '半天'),
    description,
    route: extra.route || ['游客中心', '核心景观区', '文化展示区', '休息服务区'],
    recommended: !extra.months || extra.months.includes(month),
    weather: weatherTip(spot.province, month),
    guidePhotos: photos,
    contentUpdatedAt: '2026年11月'
  }
  return { ...enrichedSpot, guideSections: buildGuideSections(enrichedSpot) }
}

function weatherTip(province, month) {
  if (['海南','广东','广西','福建','香港','澳门','台湾'].includes(province)) return month >= 5 && month <= 10 ? '天气偏热且降雨较多，准备防晒、防雨用品并及时补水。' : '气候较温和，早晚或海边风大时建议携带薄外套。'
  if (['西藏','青海','新疆','甘肃','宁夏','内蒙古'].includes(province)) return '昼夜温差较大，注意保暖、防晒和补水，高海拔地区量力而行。'
  if (month <= 2 || month === 12) return '冬季气温较低，山区道路可能结冰，请关注开放公告并做好保暖。'
  if (month >= 6 && month <= 8) return '夏季闷热且可能出现阵雨，建议避开正午并携带雨具和饮用水。'
  return '当前季节适合游览，早晚温差仍需留意，出发前请查看当地实时天气。'
}

function storageList(key) { return wx.getStorageSync(key) || [] }
function toggleStored(key, id) {
  const list = storageList(key)
  const index = list.indexOf(id)
  if (index < 0) list.unshift(id); else list.splice(index, 1)
  wx.setStorageSync(key, list)
  return index < 0
}
function detailUrl(spot) { return `/pages/detail/detail?grade=${spot.grade === '地标' ? 'landmark' : spot.grade}&id=${spot.sourceId}` }
function radians(value) { return value * Math.PI / 180 }
function distance(lat1, lon1, lat2, lon2) {
  const a = Math.sin((radians(lat2)-radians(lat1))/2) ** 2 + Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin((radians(lon2)-radians(lon1))/2) ** 2
  return Math.round(12742 * Math.asin(Math.sqrt(a)))
}
function tagsFor(spot) {
  const text = `${spot.name || ''}${spot.theme || ''}${spot.description || ''}`
  const tags = []
  if (/山|峰|峡|森林|草原/.test(text)) tags.push('自然山水')
  if (/湖|海|河|瀑|泉|湿地/.test(text)) tags.push('亲水风景')
  if (/古|宫|寺|庙|陵|遗址|博物|文化|历史/.test(text)) tags.push('历史人文')
  if (/城|街|镇|村|园林/.test(text)) tags.push('漫步游览')
  if (spot.grade === '地标') tags.push('城市地标')
  if (!tags.length) tags.push('综合游览')
  if (spot.duration === '半天') tags.push('轻松半日')
  return tags.slice(0, 3)
}

module.exports = { allSpots, getSpot, enrich, featured, provinceCenters, storageList, toggleStored, detailUrl, distance, tagsFor }
