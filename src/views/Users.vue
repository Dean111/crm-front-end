<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h1>用户管理</h1>
        <p>配置系统用户权限与角色 (RBAC)</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="openCreateModal">
           <template #icon><UserAddOutlined /></template>
           新增用户
        </a-button>
      </div>
    </div>

    <a-card :bordered="false">
      <a-table :dataSource="users" :columns="columns" :loading="loading">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag :color="getRoleColor(record.role)">{{ record.role }}</a-tag>
          </template>
          
          <template v-else-if="column.key === 'status'">
             <a-badge :status="record.status === 'ACTIVE' ? 'success' : 'error'" :text="record.status" />
          </template>

           <template v-else-if="column.key === 'action'">
              <a-space>
                 <a-button type="link" size="small" @click="editUser(record)">编辑</a-button>
                 <a-button type="link" size="small" danger>禁用</a-button>
              </a-space>
           </template>
        </template>
      </a-table>
    </a-card>

    <!-- 用户编辑弹窗 -->
    <a-modal 
       v-model:visible="modalVisible" 
       :title="editingUser ? '编辑用户' : '新增用户'"
       @ok="handleSave"
       :confirmLoading="saving"
    >
       <a-form layout="vertical" :model="formState">
          <a-form-item label="用户名" required>
             <a-input v-model:value="formState.username" />
          </a-form-item>
          <a-form-item label="电子邮箱" required>
             <a-input v-model:value="formState.email" />
          </a-form-item>
          <a-form-item label="分配角色" required>
             <a-select v-model:value="formState.role">
                <a-select-option value="ADMIN">管理员 (Admin)</a-select-option>
                <a-select-option value="MANAGER">销售经理 (Manager)</a-select-option>
                <a-select-option value="SALES">销售代表 (Sales)</a-select-option>
             </a-select>
          </a-form-item>
       </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { UserAddOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { userApi, type User } from '../api/user'

const loading = ref(false)
const users = ref<User[]>([])
const modalVisible = ref(false)
const saving = ref(false)
const editingUser = ref<User | null>(null)

const formState = reactive<Partial<User>>({
   username: '',
   email: '',
   role: 'SALES',
   password: ''
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '激活状态', dataIndex: 'isActive', key: 'status' },
  { title: '操作', key: 'action', width: 150 },
]

const loadUsers = async () => {
    loading.value = true
    try {
        users.value = await userApi.getAll()
    } catch (e) {
        console.error(e)
        // message.error('加载用户失败') 
    } finally {
         loading.value = false
    }
}

const getRoleColor = (role: string) => {
    switch(role) {
        case 'ADMIN': return 'red';
        case 'MANAGER': return 'blue';
        case 'SALES': return 'green';
        default: return 'default';
    }
}

const openCreateModal = () => {
    editingUser.value = null
    formState.username = ''
    formState.email = ''
    formState.role = 'SALES'
    formState.password = '' // 创建时允许设置密码
    modalVisible.value = true
}

const editUser = (user: User) => {
    editingUser.value = user
    formState.username = user.username
    formState.email = user.email
    formState.role = user.role
    // formState.password = undefined // 编辑时不回显密码
    modalVisible.value = true
}

const handleSave = async () => {
    saving.value = true
    try {
       // 构造 Partial<User>
       const payload: any = { ...formState, isActive: true } // 默认激活

        if (editingUser.value && editingUser.value.id) {
           await userApi.update(editingUser.value.id, payload)
        } else {
           if (!payload.password) payload.password = '123456' // 默认密码
           await userApi.create(payload as User)
        }
        message.success('保存成功')
        modalVisible.value = false
        loadUsers()
    } catch (error) {
        message.error('保存失败')
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    loadUsers()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
</style>
