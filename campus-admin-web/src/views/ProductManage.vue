<template>
  <el-card shadow="never">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="搜索商品名称 / 发布人" clearable style="width: 240px" @keyup.enter="loadList" @clear="loadList" />
      <el-select v-model="query.status" placeholder="商品状态" clearable style="width: 140px" @change="loadList">
        <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
      </el-select>
      <el-button type="primary" @click="loadList">搜索</el-button>
    </div>

    <!-- 商品列表 -->
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="publisher" label="发布人" width="110" />
      <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="110" />
      <el-table-column label="价格" width="100">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column label="图片" width="90">
        <template #default="{ row }">
          <el-image :src="row.image" style="width: 56px; height: 56px" fit="cover" :preview-src-list="[row.image]" preview-teleported>
            <template #error>
              <div class="img-error"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status]">{{ statusMap[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button link type="success" :disabled="row.status === 'on_sale'" @click="handleAudit(row, 'on_sale')">审核通过</el-button>
          <el-button link type="warning" :disabled="row.status === 'off_sale'" @click="handleAudit(row, 'off_sale')">下架</el-button>
          <el-button link type="danger" :disabled="row.status === 'rejected'" @click="handleAudit(row, 'rejected')">驳回</el-button>
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

    <!-- 商品详情弹窗 -->
    <el-dialog v-model="detailVisible" title="商品详情" width="560px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="商品ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="商品分类">{{ detail.category }}</el-descriptions-item>
        <el-descriptions-item label="商品名称" :span="2">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ detail.publisher }}</el-descriptions-item>
        <el-descriptions-item label="价格">￥{{ detail.price }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ detail.stock }}</el-descriptions-item>
        <el-descriptions-item label="交易地点">{{ detail.location }}</el-descriptions-item>
        <el-descriptions-item label="发布时间" :span="2">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="商品状态" :span="2">
          <el-tag :type="statusType[detail.status]">{{ statusMap[detail.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.rejectReason" label="驳回理由" :span="2">{{ detail.rejectReason }}</el-descriptions-item>
        <el-descriptions-item label="商品图片" :span="2">
          <el-image :src="detail.image" style="width: 160px; height: 160px" fit="cover" :preview-src-list="[detail.image]" preview-teleported>
            <template #error>
              <div class="img-error large"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="商品描述" :span="2">{{ detail.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../api/request'

// 状态展示映射
const statusMap = { pending: '待审核', on_sale: '已上架', off_sale: '下架', rejected: '驳回' }
const statusType = { pending: 'warning', on_sale: 'success', off_sale: 'info', rejected: 'danger' }

const query = reactive({ page: 1, size: 10, keyword: '', status: '' })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const detailVisible = ref(false)
const detail = ref(null)

// 加载商品列表
async function loadList() {
  loading.value = true
  try {
    const data = await request.get('/api/products', { params: query })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 查看详情
async function openDetail(row) {
  detail.value = await request.get(`/api/products/${row.id}`)
  detailVisible.value = true
}

// 审核 / 下架 / 驳回，status: on_sale | off_sale | rejected
function handleAudit(row, status) {
  const action = { on_sale: '审核通过', off_sale: '下架', rejected: '驳回' }[status]
  const doSubmit = (reason = '') => {
    request
      .put(`/api/products/${row.id}/status`, { status, reason })
      .then(() => {
        ElMessage.success(`${action}成功`)
        loadList()
      })
  }
  // 驳回需要填写理由
  if (status === 'rejected') {
    ElMessageBox.prompt('请填写驳回理由', '驳回商品', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：商品图片与描述不符',
      inputValidator: (v) => (v && v.trim() ? true : '驳回理由不能为空')
    }).then(({ value }) => doSubmit(value.trim())).catch(() => {})
  } else {
    ElMessageBox.confirm(`确认对商品「${row.name}」执行「${action}」操作？`, '提示', { type: 'warning' })
      .then(() => doSubmit()).catch(() => {})
  }
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
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.img-error.large {
  width: 160px;
  height: 160px;
}
</style>
