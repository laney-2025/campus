<template>
  <el-card shadow="never">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="搜索订单号 / 买家 / 卖家 / 商品" clearable style="width: 260px" @keyup.enter="loadList" @clear="loadList" />
      <el-select v-model="query.status" placeholder="订单状态" clearable style="width: 140px" @change="loadList">
        <el-option v-for="(item, key) in statusMap" :key="key" :label="item.label" :value="key" />
      </el-select>
      <el-button type="primary" @click="loadList">搜索</el-button>
    </div>

    <!-- 订单列表 -->
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="buyer" label="买家" width="110" />
      <el-table-column prop="seller" label="卖家" width="110" />
      <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
      <el-table-column label="交易价格" width="110">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column label="订单状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status].type">{{ statusMap[row.status].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="170" />
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      v-model:current-page="query.page"
      v-model:page-size="query.size"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadList"
      @current-change="loadList"
    />

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="560px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="订单编号" :span="2">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="买家">{{ detail.buyer }}</el-descriptions-item>
        <el-descriptions-item label="卖家">{{ detail.seller }}</el-descriptions-item>
        <el-descriptions-item label="商品名称" :span="2">{{ detail.productName }}</el-descriptions-item>
        <el-descriptions-item label="交易价格">￥{{ detail.price }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="statusMap[detail.status].type">{{ statusMap[detail.status].label }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detail.contact }}</el-descriptions-item>
        <el-descriptions-item label="商品图片" :span="2">
          <el-image :src="detail.image" style="width: 120px; height: 120px" fit="cover" :preview-src-list="[detail.image]" preview-teleported>
            <template #error>
              <div class="img-error"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="买家留言" :span="2">{{ detail.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '../api/request'

// 订单状态映射
const statusMap = {
  pending_payment: { label: '待付款', type: 'warning' },
  paid: { label: '已付款', type: 'primary' },
  shipping: { label: '交易中', type: '' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'info' }
}

const query = reactive({ page: 1, size: 10, keyword: '', status: '' })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const detailVisible = ref(false)
const detail = ref(null)

// 加载订单列表
async function loadList() {
  loading.value = true
  try {
    const data = await request.get('/api/orders', { params: query })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 查看详情
async function openDetail(row) {
  detail.value = await request.get(`/api/orders/${row.id}`)
  detailVisible.value = true
}

onMounted(loadList)
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.img-error {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}
</style>
