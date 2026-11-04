<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-body">
            <div class="stat-icon" :style="{ backgroundColor: card.bg }">
              <el-icon :size="26" color="#fff"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats[card.key] ?? '-' }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 欢迎提示 -->
    <el-card shadow="never" class="welcome-card">
      <template #header>欢迎使用</template>
      <p>欢迎使用校园二手交易平台后台管理系统。</p>
      <p>您可以通过左侧菜单进行商品管理、订单管理、举报处理与商品审核等操作。</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../api/request'

// 统计卡片配置
const cards = [
  { key: 'userTotal', label: '用户总数', icon: 'User', bg: '#409eff' },
  { key: 'productTotal', label: '商品总数', icon: 'Goods', bg: '#67c23a' },
  { key: 'pendingCount', label: '待审核数量', icon: 'Stamp', bg: '#e6a23c' },
  { key: 'reportCount', label: '举报数量', icon: 'Warning', bg: '#f56c6c' }
]

const stats = ref({})

// 加载统计数据
async function loadStats() {
  stats.value = await request.get('/api/dashboard/stats')
}

onMounted(loadStats)
</script>

<style scoped>
.stat-card {
  margin-bottom: 16px;
}

.stat-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.welcome-card {
  color: #606266;
  line-height: 1.8;
}
</style>
