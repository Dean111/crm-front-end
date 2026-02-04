<template>
  <a-layout-sider v-model:collapsed="collapsed" collapsible :width="256" class="sidebar">
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1890ff"/>
          <path d="M2 17L12 22L22 17" stroke="#1890ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="#1890ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 v-show="!collapsed">SWISS CRM</h1>
    </div>
    
    <a-menu
      v-model:selectedKeys="selectedKeys"
      theme="dark"
      mode="inline"
      @click="handleMenuClick"
    >
      <a-menu-item key="/dashboard">
        <template #icon><DashboardOutlined /></template>
        <span>仪表盘</span>
      </a-menu-item>
      
      <a-menu-item key="/customers">
        <template #icon><TeamOutlined /></template>
        <span>客户管理</span>
      </a-menu-item>
      
      <a-menu-item key="/deals">
        <template #icon><TransactionOutlined /></template>
        <span>交易管道</span>
      </a-menu-item>
      
      <a-menu-item key="/reports">
        <template #icon><BarChartOutlined /></template>
        <span>数据报表</span>
      </a-menu-item>

      <a-menu-item key="/approvals">
        <template #icon><AuditOutlined /></template>
        <span>审批中心</span>
      </a-menu-item>
      
      <a-menu-item key="/users" v-if="isAdmin">
        <template #icon><UsergroupAddOutlined /></template>
        <span>用户管理</span>
      </a-menu-item>
      
      <a-menu-item key="/settings">
        <template #icon><SettingOutlined /></template>
        <span>系统设置</span>
      </a-menu-item>
    </a-menu>

    <!-- 底部登出区域，简单实现放在 Menu 之外或作为底栏 -->
    <div class="sidebar-footer" v-if="!collapsed">
      <a-button type="text" danger block @click="handleLogout">
        <template #icon><LogoutOutlined /></template>
        退出登录
      </a-button>
    </div>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  DashboardOutlined, 
  TeamOutlined, 
  TransactionOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  LogoutOutlined,
  AuditOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const selectedKeys = ref<string[]>([])
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = ref(user.role === 'ADMIN' || user.username === 'admin' || user.email?.startsWith('admin'))

// 同步路由状态
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
  },
  { immediate: true }
)

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

const handleLogout = () => {
  router.push('/logout')
}
</script>

<style scoped lang="scss">
.logo {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
  
  .logo-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  h1 {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.3s;
  }
}

.sidebar {
  height: 100vh;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  display: flex;
  flex-direction: column;

  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
  }
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
}
</style>
