<template>
  <el-card shadow="never">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="搜索举报人 / 被举报商品" clearable style="width: 240px" @keyup.enter="loadList" @clear="loadList" />
      <el-select v-model="query.status" placeholder="处理状态" clearable style="width: 140px" @change="loadList">
        <el-option v-for="(item, key) in statusMap" :key="key" :label="item.label" :value="key" />
      </el-select>
      <el-button type="primary" @click="loadList">搜索</el-button>
    </div>

    <!-- 举报列表 -->
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="举报ID" width="80" />
      <el-table-column prop="reporter" label="举报人" width="110" />
      <el-table-column prop="productName" label="被举报商品" min-width="200" show-overflow-tooltip />
      <el-table-column prop="reason" label="举报原因" min-width="180" show-overflow-tooltip />
      <el-table-column prop="reportTime" label="举报时间" width="170" />
      <el-table-column label="处理状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status].type">{{ statusMap[row.status].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">查看</el-button>
          <el-button link type="success" :disabled="row.status !== 'pending'" @click="handle(row, 'processed')">标记已处理</el-button>
          <el-button link type="danger" :disabled="row.status !== 'pending'" @click="handle(row, 'rejected')">驳回举报</el-button>
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

    <!-- 举报详情弹窗 -->
    <el-dialog v-model="detailVisible" title="举报详情" width="560px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="举报ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="举报人">{{ detail.reporter }}</el-descriptions-item>
        <el-descriptions-item label="被举报商品" :span="2">{{ detail.productName }}</el-descriptions-item>
        <el-descriptions-item label="商品图片" :span="2">
          <el-image :src="detail.productImage" style="width: 120px; height: 120px" fit="cover" :preview-src-list="[detail.productImage]" preview-teleported>
            <template #error>
              <div class="img-error"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="举报原因" :span="2">{{ detail.reason }}</el-descriptions-item>
        <el-descriptions-item label="举报时间">{{ detail.reportTime }}</el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="statusMap[detail.status].type">{{ statusMap[detail.status].label }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.handleTime" label="处理时间" :span="2">{{ detail.handleTime }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.handleResult" label="处理结果" :span="2">{{ detail.handleResult }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../api/request'

// 处理状态映射
const statusMap = {
  pending: { label: '待处理', type: 'warning' },
  processed: { label: '已处理', type: 'success' },
  rejected: { label: '已驳回', type: 'info' }
}

const query = reactive({ page: 1, size: 10, keyword: '', status: '' })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const detailVisible = ref(false)
const detail = ref(null)

// 加载举报列表
async function loadList() {
  loading.value = true
  try {
    const data = await request.get('/api/reports', { params: query })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 查看详情
async function openDetail(row) {
  detail.value = row
  detailVisible.value = true
}

// 标记已处理 / 驳回举报，status: processed | rejected
function handle(row, status) {
  const action = status === 'processed' ? '标记为已处理' : '驳回该举报'
  const doSubmit = (result = '') => {
    request
      .put(`/api/reports/${row.id}/handle`, { status, result })
      .then(() => {
        ElMessage.success('操作成功')
        loadList()
      })
  }
  ElMessageBox.prompt(`请填写处理说明，确认将举报 #${row.id} ${action}`, '举报处理', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：已核实并下架该商品 / 举报内容不属实',
    inputValidator: (v) => (v && v.trim() ? true : '处理说明不能为空')
  })
    .then(({ value }) => doSubmit(value.trim()))
    .catch(() => {})
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
