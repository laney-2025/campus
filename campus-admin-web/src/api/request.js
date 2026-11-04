/**
 * axios 实例：所有页面统一通过此实例请求接口
 * 当前使用 mockAdapter 返回模拟数据，对接真实后端时删除 adapter 配置并配置 baseURL 即可
 */
import axios from 'axios'
import mockAdapter from '../mock/mockAdapter'
import { ElMessage } from 'element-plus'

const request = axios.create({
  timeout: 5000,
  adapter: mockAdapter // 使用 mock 适配器，未对接真实后端
})

// 响应拦截器：统一解包 { code, message, data }，统一错误提示
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res.data
  },
  (error) => {
    ElMessage.error(error.message || '网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default request
