<template>
  <div class="deals-page">
    <div class="page-header">
      <div class="header-left">
        <h1>交易管道</h1>
        <p>跟进您的销售漏斗</p>
      </div>
      <a-button type="primary" size="large" @click="openCreateForm">
        <template #icon><PlusOutlined /></template>
        创建交易
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <div class="kanban-board">
        <div v-for="column in pipelineData" :key="column.stage" class="kanban-column">
          <div class="column-header">
            <h3>{{ getStageName(column.stage) }}</h3>
            <span class="count">{{ column.deals.length }}</span>
          </div>
          
          <draggable
            v-model="column.deals"
            group="deals"
            item-key="id"
            class="column-content"
            :animation="200"
            ghost-class="ghost-card"
            @change="(e) => handleDragChange(e, column.stage)"
          >
            <template #item="{ element: deal }">
              <a-card 
                class="deal-card" 
                size="small"
                hoverable
              >
                <template #title>
                  <div class="card-title">{{ deal.title }}</div>
                </template>
                <div class="card-amount">${{ deal.amount.toLocaleString() }}</div>
                <div class="card-customer" v-if="deal.customerName">
                  <UserOutlined /> {{ deal.customerName }}
                </div>
                
                <div class="card-monitor">
                  <a-progress :percent="deal.probability" size="small" :status="getProbabilityStatus(deal.probability)" />
                </div>

                <template #actions>
                  <EditOutlined key="edit" @click.stop="openEditForm(deal)" />
                  <ellipsis-outlined key="ellipsis" />
                </template>
              </a-card>
            </template>
          </draggable>
          
          <div v-if="column.deals.length === 0" class="empty-placeholder">
             (拖拽至此)
          </div>
        </div>
      </div>
    </a-spin>
    
    <DealForm 
      :isOpen="showForm" 
      :editData="editingDeal"
      @close="closeForm"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dealApi, type Deal } from '../api/deal'
import DealForm from '../components/DealForm.vue'
import draggable from 'vuedraggable'
import { 
  PlusOutlined, 
  UserOutlined, 
  EditOutlined, 
  EllipsisOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

interface PipelineColumn {
  stage: string
  deals: Deal[]
}

const loading = ref(false)
const pipelineData = ref<PipelineColumn[]>([
  { stage: 'QUALIFICATION', deals: [] },
  { stage: 'PROPOSAL', deals: [] },
  { stage: 'NEGOTIATION', deals: [] },
  { stage: 'WON', deals: [] }
])

// ...imports
import { Modal } from 'ant-design-vue'
import { approvalApi } from '../api/approval'

// 用户权限
const activeUser = JSON.parse(localStorage.getItem('user') || '{}')
const isManager = ['ADMIN', 'MANAGER'].includes(activeUser.role)

// ...

// 拖拽处理
const handleDragChange = async (event: any, newStage: string) => {
  if (event.added) {
    const deal = event.added.element
    // deal.stage 还是旧的值，因为我们在后端更新成功前不应该改它
    // 或者说，我们需要记录旧值。其实 deal.stage 此时就是旧值。
    
    // 1. 普通用户：发起审批
    if (!isManager) {
        Modal.confirm({
            title: '发起审批申请',
            content: `您没有直接变更阶段的权限。是否申请将 "${deal.title}" 变更到 ${getStageName(newStage)}？`,
            onOk: async () => {
                try {
                    await approvalApi.create({
                       title: `申请变更阶段: ${deal.title}`,
                       type: 'DEAL_STAGE',
                       dealId: deal.id,
                       applicantId: activeUser.id,
                       applicantName: activeUser.username || activeUser.fullName || 'User',
                       currentStage: deal.stage,
                       targetStage: newStage,
                       amount: deal.amount,
                       status: 'PENDING'
                    })
                    message.success('已提交审批申请，请等待主管审核')
                } catch (e: any) {
                    console.error('Approval submit error:', e)
                    message.error('提交申请失败')
                } finally {
                    loadDeals() // 无论成功失败，都刷新列表以回滚拖拽位置（直到审批通过）
                }
            },
            onCancel: () => {
                loadDeals() // 取消操作，回滚 UI
            }
        })
        return
    }
    
    // 2. 管理员/经理：直接更新
    const oldStage = deal.stage
    deal.stage = newStage // 乐观更新本地状态
    
    try {
      if (deal.id) {
          await dealApi.update(deal.id, { ...deal, stage: newStage })
          message.success(`交易移动到 ${getStageName(newStage)}`)
      }
    } catch (error) {
      console.error(error)
      message.error('更新状态失败')
      deal.stage = oldStage // 本地回滚
      loadDeals() 
    }
  }
}


// ... (保留其余代码)

// 表单控制
const showForm = ref(false)
const editingDeal = ref<Deal | null>(null)

const openCreateForm = () => {
  editingDeal.value = null
  showForm.value = true
}

const openEditForm = (deal: Deal) => {
  editingDeal.value = deal
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingDeal.value = null
}

const handleFormSuccess = () => {
  message.success('操作成功')
  loadDeals()
}

// 加载交易数据
const loadDeals = async () => {
  loading.value = true
  try {
    const response = await dealApi.getAll()
    if (response.success) {
      // 重置数据
      const columns: PipelineColumn[] = [
        { stage: 'QUALIFICATION', deals: [] },
        { stage: 'PROPOSAL', deals: [] },
        { stage: 'NEGOTIATION', deals: [] },
        { stage: 'WON', deals: [] }
      ]
      
      const deals = Array.isArray(response.data) ? response.data : [response.data]

      // 分配交易到各列
      deals.forEach(deal => {
        const column = columns.find(c => c.stage === deal.stage)
        if (column) {
          column.deals.push(deal)
        }
      })
      
      pipelineData.value = columns
    }
  } catch (err) {
    message.error('加载交易数据失败')
  } finally {
    loading.value = false
  }
}

const getStageName = (stage: string) => {
  const names: Record<string, string> = {
    'QUALIFICATION': '资格审查',
    'PROPOSAL': '方案报价',
    'NEGOTIATION': '商务谈判',
    'WON': '已成交'
  }
  return names[stage] || stage
}

const getProbabilityStatus = (prob?: number) => {
  if (!prob) return 'normal'
  if (prob >= 80) return 'success'
  if (prob < 30) return 'exception'
  return 'active'
}

onMounted(() => {
  loadDeals()
})
</script>

<style scoped lang="scss">
.deals-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    font-weight: 500;
    margin: 0;
  }
  
  p {
    color: #8c8c8c;
    margin: 4px 0 0;
  }
}

.kanban-board {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: 500px;
}

.kanban-column {
  flex: 1;
  min-width: 280px;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #595959;
  }
  
  .count {
    background: #d9d9d9;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: #595959;
  }
}

.column-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deal-card {
  cursor: grab;
  
  .card-title {
    font-weight: 500;
    white-space: normal;
  }
  
  .card-amount {
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
    margin: 8px 0;
  }
  
  .card-customer {
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 12px;
  }
}

.ghost-card {
  opacity: 0.5;
  background: #e6f7ff;
  border: 1px dashed #1890ff;
}

.empty-column {
  /* 旧的 empty-column 可能不再需要，或者保留作为备份 */
  text-align: center;
  color: #bfbfbf;
  margin-top: 24px;
  display: none; 
}

.empty-placeholder {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfbfbf;
  border: 2px dashed #f0f0f0;
  border-radius: 4px;
  margin-top: 8px;
  background-color: #fafafa;
}
</style>
