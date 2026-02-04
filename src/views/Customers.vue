<template>
  <div class="customers-page">
    <div class="page-header">
      <div class="header-left">
        <h1>客户管理</h1>
        <p>管理您的所有客户信息</p>
      </div>
      <a-button type="primary" size="large" @click="openAddForm">
        <template #icon><PlusOutlined /></template>
        新增客户
      </a-button>
    </div>

    <!-- 搜索栏 -->
    <a-card class="search-card" :bordered="false">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="搜索姓名、邮箱或公司..."
        enter-button
        size="large"
        @search="loadCustomers"
      />
    </a-card>

    <!-- 客户列表 -->
    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data-source="customers"
        :loading="loading"
        :row-key="(record: Customer) => record.id"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-space>
              <a-avatar style="background-color: #f56a00">{{ record.name.charAt(0) }}</a-avatar>
              <div class="customer-info">
                <div class="name">{{ record.name }}</div>
                <div class="email-sub">{{ record.email }}</div>
              </div>
            </a-space>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
               <a-button type="link" size="small" @click="openEditForm(record)">编辑</a-button>
               <a-popconfirm
                  title="确定删除该客户吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="handleDelete(record.id)"
                >
                  <a-button type="link" danger size="small">删除</a-button>
                </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <CustomerForm 
      :isOpen="showForm" 
      :editData="editingCustomer"
      @close="closeForm"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { customerApi, type Customer } from '../api/customer'
import CustomerForm from '../components/CustomerForm.vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const loading = ref(false)
const customers = ref<Customer[]>([])
const searchQuery = ref('')

// 表单控制
const showForm = ref(false)
const editingCustomer = ref<Customer | null>(null)

const columns = [
  {
    title: '客户',
    dataIndex: 'name',
    key: 'name',
    width: 300,
  },
  {
    title: '公司',
    dataIndex: 'company',
    key: 'company',
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
  },
]

const loadCustomers = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchQuery.value) {
      params.keyword = searchQuery.value
    }

    const response = await customerApi.getAll(params)
    if (response.success) {
      if (Array.isArray(response.data)) {
        customers.value = response.data
      } else {
        // 如果后端返回非数组（例如分页对象被扁平化或错误结构），尝试做兼容
        customers.value = []
      }
    } else {
      message.error(response.message || '加载客户失败')
    }
  } catch (err) {
    console.error(err)
    message.error('加载客户异常')
  } finally {
    loading.value = false
  }
}

const openAddForm = () => {
  editingCustomer.value = null
  showForm.value = true
}

const openEditForm = (customer: Customer) => {
  editingCustomer.value = customer
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingCustomer.value = null
}

const handleFormSuccess = () => {
  message.success('保存成功')
  loadCustomers() // 刷新列表
}

const handleDelete = async (id?: number) => {
  if (!id) return
  try {
    await customerApi.delete(id)
    message.success('删除成功')
    loadCustomers()
  } catch (error) {
    message.error('删除失败')
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VIP': return 'gold'
    case 'ACTIVE': return 'green'
    case 'INACTIVE': return 'default'
    default: return 'blue'
  }
}

onMounted(() => {
  loadCustomers()
})
</script>

<style scoped lang="scss">
.customers-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
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

.search-card {
  margin-bottom: 0;
}

.table-card {
  padding: 0;
}

.customer-info {
  display: flex;
  flex-direction: column;
  
  .name {
    font-weight: 500;
  }
  
  .email-sub {
    font-size: 12px;
    color: #8c8c8c;
  }
}
</style>
