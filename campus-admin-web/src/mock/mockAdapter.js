/**
 * Axios 适配层：自定义 axios adapter，拦截请求并返回 mock 数据
 * 这样页面代码完全按真实接口方式调用 axios，未来对接真实后端只需移除 mockAdapter
 */
import mockRoutes from './mockRoutes'

// 简易路径匹配：/api/products/:id -> 正则
function matchRoute(url, method) {
  for (const route of mockRoutes) {
    if (route.method !== method.toLowerCase()) continue
    // 将 :param 转为正则分组
    const pattern = route.path.replace(/:[^/]+/g, '([^/]+)')
    const regex = new RegExp(`^${pattern}/?$`)
    const m = url.match(regex)
    if (m) return { route, params: m.slice(1) }
  }
  return null
}

function mockAdapter(config) {
  return new Promise((resolve, reject) => {
    const { url, method, params, data } = config
    // 去掉查询串再匹配路径
    const [pathname] = url.split('?')
    const matched = matchRoute(pathname, method)

    setTimeout(() => {
      if (!matched) {
        reject(new Error(`Mock 未定义接口: ${method.toUpperCase()} ${url}`))
        return
      }
      try {
        const body = data ? JSON.parse(data) : {}
        const result = matched.route.handler({
          params: params || {},      // url 查询参数
          path: matched.params,      // 路径参数数组
          body                       // 请求体
        })
        resolve({
          data: { code: 0, message: 'ok', data: result },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        })
      } catch (e) {
        reject(e)
      }
    }, 200) // 模拟网络延迟 200ms
  })
}

export default mockAdapter
