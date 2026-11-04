<template>
  <el-card shadow="never">
    <div class="page-tip">
      <el-alert title="本页面用于审核用户发布的二手商品，审核通过后商品将上架展示" type="info" :closable="false" show-icon />
    </div>

    <!-- 待审核商品列表 -->
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="商品ID" width="80" />
      <el-table-column prop="publisher" label="发布人" width="110" />
      <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="110" />
      <el-table-column label="价格" width="100">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column label="商品图片" width="100">
        <template #default="{ row }">
          <el-image :src="row.image" style="width: 64px; height: 64px" fit="cover" :preview-src-list="[row.image]" preview-teleported>
            <template #error>
              <div class="img-error"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">查看</el-button>
          <el-button type="success" size="small" @click="approve(row)">审核通过</el-button>
          <el-button type="danger" size="small" @click="reject(row)">驳回</el-button>
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

    <!-- 审核用商品详情弹窗 -->
    <el-dialog v-model="detailVisible" title="商品信息（审核）" width="560px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="商品ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="商品分类">{{ detail.category }}</el-descriptions-item>
        <el-descriptions-item label="商品名称" :span="2">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ detail.publisher }}</el-descriptions-item>
        <el-descriptions-item label="价格">￥{{ detail.price }}</el-descriptions-item>
        <el-descriptions-item label="交易地点" :span="2">{{ detail.location }}</el-descriptions-item>
        <el-descriptions-item label="商品图片" :span="2">
          <el-image :src="detail.image" style="width: 180px; height: 180px" fit="cover" :preview-src-list="[detail.image]" preview-teleported>
            <template #error>
              <div class="img-error large"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="商品描述" :span="2">{{ detail.description }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="success" @click="approve(detail)">审核通过</el-button>
        <el-button type="danger" @click="reject(detail)">驳回</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../api/request'

const query = reactive({ page: 1, size: 10, status: 'pending' }) // 固定查询待审核商品
const list = ref([])
const total = ref(0)
const loading = ref(false)
const detailVisible = ref(false)
const detail = ref(null)

// 加载待审核商品列表
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

// 表格行点击查看详情
function openDetail(row) {
  detail.value = row
  detailVisible.value = true
}

// 审核通过
function approve(row) {
  ElMessageBox.confirm(`确认审核通过商品「${row.name}」？通过后商品将立即上架。`, '审核确认', { type: 'success' })
    .then(async () => {
      await request.put(`/api/products/${row.id}/status`, { status: 'on_sale' })
      ElMessage.success('审核通过，商品已上架')
      detailVisible.value = false
      loadList()
    })
    .catch(() => {})
}

// 驳回并填写理由
function reject(row) {
  ElMessageBox.prompt('请填写驳回理由', `驳回商品「${row.name}」`, {
    confirmButtonText: '确定驳回',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：商品图片与描述不符，请补充实拍图后重新提交',
    inputValidator: (v) => (v && v.trim() ? true : '驳回理由不能为空')
  })
    .then(async ({ value }) => {
      await request.put(`/api/products/${row.id}/status`, { status: 'rejected', reason: value.trim() })
      ElMessage.success('已驳回并通知发布人修改')
      detailVisible.value = false
      loadList()
    })
    .catch(() => {})
}

onMounted(loadList)
</script>

<style scoped>
.page-tip {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.img-error {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.img-error.large {
  width: 180px;
  height: 180px;
}
</style>
