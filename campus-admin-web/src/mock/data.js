/**
 * Mock 模拟数据（内存数据，刷新页面重置）
 * 模拟校园二手交易平台的用户、商品、订单、举报数据
 */

// 随机取值工具
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// 日期格式化 yyyy-MM-dd HH:mm:ss
function fmt(date) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
}

// 随机生成最近 n 天内的一个时间字符串
function randDate(days) {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, days))
  d.setHours(randInt(8, 22), randInt(0, 59), randInt(0, 59), 0)
  return fmt(d)
}

const userNames = ['张同学', '李同学', '王同学', '刘同学', '陈同学', '赵同学', '孙同学', '周同学', '吴同学', '郑同学', '林同学', '黄同学']
const categories = ['数码电子', '图书教材', '生活用品', '运动器材', '服饰鞋包', '美妆护肤']
const productNames = ['iPad Air 5 95新', '高等数学教材 第七版', '小米台灯 Pro', '尤尼克斯羽毛球拍', '北欧风双肩背包', '雅诗兰黛小棕瓶',
  '罗技 G102 鼠标', '英语四级真题试卷', '宜家折叠书桌', '健身瑜伽垫', '耐克跑步鞋 43码', 'Kindle 电子书阅读器',
  '机械键盘 87键', '数据结构与算法教材', '宿舍收纳箱套装', '长板滑板 42寸', '化妆刷套装', '卡西欧手表']

// 商品状态：pending 待审核 / on_sale 已上架 / off_sale 下架 / rejected 驳回
const productStatusList = ['pending', 'on_sale', 'off_sale', 'rejected']

// 生成商品数据（id 1~100）
export const products = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1
  const status = id <= 12 ? 'pending' : pick(productStatusList) // 保证前 12 条为待审核，便于审核页演示
  return {
    id,
    publisher: pick(userNames),
    name: pick(productNames) + ` #${id}`,
    category: pick(categories),
    price: randInt(5, 3000),
    // 使用 picsum 占位图，离线时显示 el-image 的加载失败占位
    image: `https://picsum.photos/seed/goods${id}/200/200`,
    status,
    rejectReason: status === 'rejected' ? pick(['图片模糊不清', '涉嫌违规内容', '商品描述与图片不符', '价格明显异常']) : '',
    description: '九成新，自用闲置出，成色良好，支持校内面交或快递发货，可小刀，非诚勿扰。',
    createTime: randDate(90),
    stock: randInt(1, 5),
    location: pick(['东区宿舍 5 栋', '西区宿舍 12 栋', '南门快递驿站', '图书馆门口', '教学楼 A 座'])
  }
})

// 订单状态：pending_payment 待付款 / paid 已付款 / shipping 交易中 / completed 已完成 / cancelled 已取消
const orderStatusList = ['pending_payment', 'paid', 'shipping', 'completed', 'cancelled']

// 生成订单数据（可售商品）
const saleProducts = products.filter((p) => p.status === 'on_sale')
export const orders = Array.from({ length: 60 }, (_, i) => {
  const goods = pick(saleProducts)
  const seller = goods.publisher
  let buyer = pick(userNames)
  while (buyer === seller) buyer = pick(userNames)
  return {
    id: i + 1,
    orderNo: `CNO${String(2026110100 + i)}`,
    buyer,
    seller,
    productId: goods.id,
    productName: goods.name,
    image: goods.image,
    price: goods.price,
    status: pick(orderStatusList),
    createTime: randDate(60),
    payTime: '',
    contact: `1${randInt(3, 9)}${String(randInt(0, 99999999)).padStart(8, '0')}`,
    remark: pick(['希望晚上六点南门面交', '可以包邮吗？', '请尽快发货', ''])
  }
})

// 举报状态：pending 待处理 / processed 已处理 / rejected 已驳回
const reportStatusList = ['pending', 'processed', 'rejected']
const reasons = ['商品涉嫌虚假描述', '商品为违禁物品', '价格欺诈，恶意抬价', '图片盗用他人商品', '卖家态度恶劣，拒不发货', '商品与描述严重不符']

// 生成举报数据
export const reports = Array.from({ length: 35 }, (_, i) => {
  const goods = pick(products)
  return {
    id: i + 1,
    reporter: pick(userNames),
    productId: goods.id,
    productName: goods.name,
    productImage: goods.image,
    reason: pick(reasons),
    reportTime: randDate(30),
    status: i < 8 ? 'pending' : pick(reportStatusList), // 前 8 条待处理
    handleTime: '',
    handleResult: ''
  }
})

// 仪表盘统计（从现有数据汇总）
export function getDashboardStats() {
  return {
    userTotal: 1286,
    productTotal: products.length,
    pendingCount: products.filter((p) => p.status === 'pending').length,
    reportCount: reports.filter((r) => r.status === 'pending').length
  }
}
