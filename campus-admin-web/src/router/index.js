import { createRouter, createWebHashHistory } from 'vue-router'

// 页面组件懒加载
const AdminLayout = () => import('../layout/AdminLayout.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const ProductManage = () => import('../views/ProductManage.vue')
const OrderManage = () => import('../views/OrderManage.vue')
const ReportManage = () => import('../views/ReportManage.vue')
const AuditManage = () => import('../views/AuditManage.vue')

const routes = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { title: '首页仪表盘' } },
      { path: 'products', name: 'ProductManage', component: ProductManage, meta: { title: '商品管理' } },
      { path: 'orders', name: 'OrderManage', component: OrderManage, meta: { title: '订单管理' } },
      { path: 'reports', name: 'ReportManage', component: ReportManage, meta: { title: '举报管理' } },
      { path: 'audit', name: 'AuditManage', component: AuditManage, meta: { title: '审核管理' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
