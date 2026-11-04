/**
 * Mock 接口路由表：定义所有模拟接口及处理逻辑
 * 分页返回统一结构 { list, total, page, size }
 */
import { products, orders, reports, getDashboardStats } from './data'

// 通用分页处理
function paginate(list, { page = 1, size = 10 }) {
  const p = Number(page)
  const s = Number(size)
  return {
    list: list.slice((p - 1) * s, p * s),
    total: list.length,
    page: p,
    size: s
  }
}

export default [
  // ---------- 仪表盘 ----------
  {
    method: 'get',
    path: '/api/dashboard/stats',
    handler: () => getDashboardStats()
  },

  // ---------- 商品 ----------
  {
    method: 'get',
    path: '/api/products',
    handler: ({ params }) => {
      let list = [...products]
      if (params.keyword) list = list.filter((p) => p.name.includes(params.keyword) || p.publisher.includes(params.keyword))
      if (params.category) list = list.filter((p) => p.category === params.category)
      if (params.status) list = list.filter((p) => p.status === params.status)
      list.sort((a, b) => b.id - a.id)
      return paginate(list, params)
    }
  },
  {
    method: 'get',
    path: '/api/products/:id',
    handler: ({ path }) => {
      const item = products.find((p) => p.id === Number(path[0]))
      if (!item) throw new Error('商品不存在')
      return item
    }
  },
  {
    method: 'put',
    path: '/api/products/:id/status',
    handler: ({ path, body }) => {
      const item = products.find((p) => p.id === Number(path[0]))
      if (!item) throw new Error('商品不存在')
      item.status = body.status
      item.rejectReason = body.reason || ''
      return item
    }
  },

  // ---------- 订单 ----------
  {
    method: 'get',
    path: '/api/orders',
    handler: ({ params }) => {
      let list = [...orders]
      if (params.keyword) list = list.filter((o) => o.orderNo.includes(params.keyword) || o.buyer.includes(params.keyword) || o.seller.includes(params.keyword) || o.productName.includes(params.keyword))
      if (params.status) list = list.filter((o) => o.status === params.status)
      list.sort((a, b) => b.id - a.id)
      return paginate(list, params)
    }
  },
  {
    method: 'get',
    path: '/api/orders/:id',
    handler: ({ path }) => {
      const item = orders.find((o) => o.id === Number(path[0]))
      if (!item) throw new Error('订单不存在')
      return item
    }
  },

  // ---------- 举报 ----------
  {
    method: 'get',
    path: '/api/reports',
    handler: ({ params }) => {
      let list = [...reports]
      if (params.keyword) list = list.filter((r) => r.reporter.includes(params.keyword) || r.productName.includes(params.keyword))
      if (params.status) list = list.filter((r) => r.status === params.status)
      list.sort((a, b) => b.id - a.id)
      return paginate(list, params)
    }
  },
  {
    method: 'put',
    path: '/api/reports/:id/handle',
    handler: ({ path, body }) => {
      const item = reports.find((r) => r.id === Number(path[0]))
      if (!item) throw new Error('举报不存在')
      item.status = body.status // processed 已处理 / rejected 已驳回
      item.handleTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      item.handleResult = body.result || ''
      return item
    }
  }
]
