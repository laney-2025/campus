# 校园二手交易平台 - 后台管理前端

技术栈：Vue 3 + Element Plus + Vue Router + Axios + Vite，纯前端项目，所有接口通过 axios mock 适配器返回模拟数据，无需后端即可运行。

## 运行方式

```bash
npm install
npm run dev
```

启动后浏览器自动打开 http://localhost:5173（使用 hash 路由）。

## 功能页面

| 菜单 | 路由 | 说明 |
| ---- | ---- | ---- |
| 首页仪表盘 | `/dashboard` | 用户总数、商品总数、待审核数量、举报数量统计卡片 |
| 商品管理 | `/products` | 商品列表（分页、搜索、详情、审核通过/下架/驳回） |
| 订单管理 | `/orders` | 订单列表（分页、搜索、订单详情） |
| 举报管理 | `/reports` | 举报列表（查看、标记已处理、驳回举报） |
| 审核管理 | `/audit` | 待审核商品列表（查看图片、审核通过、驳回并填写理由） |

公共布局包含左侧导航栏（可折叠）、顶部导航栏与面包屑导航。

## 目录结构

```
src/
├── api/request.js          # axios 实例与响应拦截器（统一解包、错误提示）
├── mock/
│   ├── data.js             # mock 模拟数据（商品、订单、举报、统计）
│   ├── mockRoutes.js       # mock 接口路由表（增删改查逻辑）
│   └── mockAdapter.js      # 自定义 axios adapter，拦截请求返回 mock 数据
├── layout/AdminLayout.vue  # 公共布局：侧边栏 + 顶栏 + 面包屑
├── router/index.js         # 路由配置
├── views/                  # 页面组件
├── App.vue
└── main.js
```

## 对接真实后端

页面均按真实接口方式调用 axios。对接后端时只需：

1. 删除 `src/api/request.js` 中的 `adapter: mockAdapter` 配置，改为 `baseURL` 指向后端地址；
2. 保持后端接口路径与 `src/mock/mockRoutes.js` 中的路由一致，响应结构为 `{ code: 0, message, data }`。
