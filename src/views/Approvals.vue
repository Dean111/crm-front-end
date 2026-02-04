<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h1>审批中心</h1>
        <p>处理业务流转中的审批请求</p>
      </div>
    </div>

    <!-- 审批统计报表区域 -->
    <a-row :gutter="24" class="mb-4">
      <a-col :span="24">
        <a-card title="审批概览" :bordered="false">
          <div ref="chartRef" style="height: 300px; width: 100%;"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-tabs v-model:activeKey="activeTab" type="card">
      <a-tab-pane key="pending" tab="待我审批" v-if="canApprove">
          <!-- Pending List -->
          <a-card :bordered="false" class="approval-card">
             <a-list item-layout="vertical" :data-source="pendingApprovals" :loading="loading">
                <template #renderItem="{ item }">
                   <a-list-item key="item.id" class="approval-item">
                      <template #extra>
                         <div class="action-buttons">
                            <a-button type="primary" @click="handleApprove(item)">通过</a-button>
                            <a-button danger @click="handleReject(item)">拒绝</a-button>
                         </div>
                      </template>
                      <a-list-item-meta :description="formatDate(item.createdAt)">
                         <template #title>
                            <a-tag color="orange">待处理</a-tag> {{ item.title }}
                         </template>
                         <template #avatar>
                            <a-avatar style="background-color: #1890ff">{{ (item.applicantName || 'U')[0] }}</a-avatar>
                         </template>
                      </a-list-item-meta>
                      <div class="approval-content">
                         <div class="info-row">
                            <span class="label">申请人：</span>
                            <span class="value">{{ item.applicantName }}</span>
                         </div>
                         <div class="info-row" v-if="item.amount">
                            <span class="label">涉及金额：</span>
                            <span class="value salary">${{ item.amount.toLocaleString() }}</span>
                         </div>
                          <div class="info-row">
                            <span class="label">当前阶段：</span>
                            <span class="value">{{ item.currentStage }}</span>
                            <span class="arrow">→</span>
                            <span class="label">目标阶段：</span>
                            <span class="value highlight">{{ item.targetStage }}</span>
                         </div>
                      </div>
                   </a-list-item>
                </template>
                <div v-if="!loading && pendingApprovals.length === 0" class="text-center py-4 text-gray-400">
                    暂无待审批项
                </div>
             </a-list>
          </a-card>
      </a-tab-pane>
      
      <a-tab-pane key="my" tab="我的申请">
          <a-table 
            :dataSource="myApprovals" 
            :columns="historyColumns" 
            :loading="loading"
            rowKey="id"
          >
             <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                   <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
                </template>
                <template v-else-if="column.key === 'createdAt'">
                    {{ formatDate(record.createdAt) }}
                </template>
             </template>
          </a-table>
          <div v-if="!loading && myApprovals.length === 0" class="text-center py-4 text-gray-400">
              暂无申请记录 <span v-if="!activeUser.id">(请尝试重新登录)</span>
          </div>
      </a-tab-pane>

      <a-tab-pane key="history" tab="审批记录" v-if="canApprove">
          <a-table 
            :dataSource="historyApprovals" 
            :columns="historyColumns" 
            :loading="loading"
            rowKey="id"
          >
             <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                   <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
                </template>
                <template v-else-if="column.key === 'createdAt'">
                    {{ formatDate(record.createdAt) }}
                </template>
                <template v-else-if="column.key === 'processedAt'">
                    {{ formatDate(record.processedAt) }}
                </template>
             </template>
          </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { approvalApi, type Approval } from '../api/approval'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

const activeTab = ref('pending')
const loading = ref(false)
const pendingApprovals = ref<Approval[]>([])
const historyApprovals = ref<Approval[]>([])
const myApprovals = ref<Approval[]>([])
const chartRef = ref<HTMLElement>()

// 权限控制
const activeUser = JSON.parse(localStorage.getItem('user') || '{}')
const canApprove = computed(() => ['ADMIN', 'MANAGER'].includes(activeUser.role))

// 如果不能审批，默认切到 my Tab
if (!canApprove.value) {
    activeTab.value = 'my'
}

const historyColumns = [
    { title: '审批事项', dataIndex: 'title', key: 'title' },
    { title: '申请人', dataIndex: 'applicantName', key: 'applicantName' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '处理时间', dataIndex: 'processedAt', key: 'processedAt' }
]

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

const getStatusColor = (status: string) => {
    switch(status) {
        case 'APPROVED': return 'green'
        case 'REJECTED': return 'red'
        case 'PENDING': return 'orange'
        default: return 'default'
    }
}

const loadData = async () => {
    loading.value = true
    try {
        const promises = []
        if (canApprove.value) {
            promises.push(approvalApi.getPending().then(res => pendingApprovals.value = Array.isArray(res) ? res : []))
            promises.push(approvalApi.getHistory().then(res => historyApprovals.value = Array.isArray(res) ? res : []))
        }
        
        if (activeUser.id) {
             const p = approvalApi.getMy(activeUser.id)
                .then(res => {
                    myApprovals.value = Array.isArray(res) ? res : []
                    // 如果普通用户，且 myApprovals 有数据，顺便算进图表？
                    // 其实 renderChart 在 Promise.all 后统一调用
                })
                .catch(err => {
                    console.error('Fetch my approvals failed', err)
                    myApprovals.value = []
                })
             promises.push(p)
        }

        await Promise.all(promises)
        renderChart() 
    } catch (e) {
        console.error('Load data error:', e)
    } finally {
        loading.value = false
    }
}

const handleApprove = async (item: Approval) => {
    try {
        if (!item.id) return
        await approvalApi.process(item.id, true)
        message.success('已通过审批')
        loadData()
    } catch (e) {
        message.error('操作失败')
    }
}

const handleReject = async (item: Approval) => {
    try {
        if (!item.id) return
        await approvalApi.process(item.id, false)
        message.warn('已拒绝申请')
        loadData()
    } catch (e) {
        message.error('操作失败')
    }
}

// 图表渲染
let chartInstance: echarts.ECharts | null = null

const renderChart = () => {
    if (!chartRef.value) return
    if (!chartInstance) chartInstance = echarts.init(chartRef.value)
    
    // 统计数据源: 如果是管理员，看所有 pending/history; 如果是普通用户，看 myApprovals
    const source = canApprove.value 
        ? [...historyApprovals.value, ...pendingApprovals.value]
        : myApprovals.value

    const approvedCount = source.filter(i => i.status === 'APPROVED').length
    const rejectedCount = source.filter(i => i.status === 'REJECTED').length
    const pendingCount = source.filter(i => i.status === 'PENDING').length
    
    chartInstance.setOption({
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center' },
        series: [
            {
                name: '审批状态',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: { show: true, fontSize: '20', fontWeight: 'bold' }
                },
                data: [
                    { value: approvedCount, name: '已通过', itemStyle: { color: '#52c41a' } },
                    { value: rejectedCount, name: '已拒绝', itemStyle: { color: '#ff4d4f' } },
                    { value: pendingCount, name: '待审批', itemStyle: { color: '#faad14' } }
                ]
            }
        ]
    })
}

onMounted(() => {
    loadData()
    window.addEventListener('resize', () => chartInstance?.resize())
})
</script>

<style scoped lang="scss">
.page-header {
  margin-bottom: 24px;
}
.mb-4 { margin-bottom: 24px; }

.approval-item {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 0;
    &:last-child { border-bottom: none; }
}

.approval-content {
    margin-left: 48px;
    margin-top: 12px;
    background: #fafafa;
    padding: 16px;
    border-radius: 4px;
    
    .info-row {
        margin-bottom: 8px;
        font-size: 14px;
        .label { color: #8c8c8c; }
        .value { color: #262626; font-weight: 500; }
        .salary { color: #cf1322; }
        .highlight { color: #1890ff; }
        .arrow { margin: 0 8px; color: #bfbfbf; }
    }
}

.action-buttons {
    display: flex;
    gap: 12px;
}
</style>
