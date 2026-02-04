<template>
  <a-layout class="main-layout">
    <Sidebar />
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <span class="header-title">{{ currentRouteName }}</span>
        <div class="header-actions">
          <a-dropdown placement="bottomRight">
            <div class="user-trigger">
              <a-avatar style="background-color: #1890ff">{{ avatarText }}</a-avatar>
              <span class="user-name">{{ activeUser.username || activeUser.fullName || 'User' }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="handleToProfile">
                  <template #icon><UserOutlined /></template>
                  个人中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <template #icon><LogoutOutlined /></template>
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content style="margin: 24px 16px 0; overflow-y: auto;">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px', borderRadius: '4px' }">
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Swiss CRM ©2026 Created by Antigravity
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()

const activeUser = JSON.parse(localStorage.getItem('user') || '{}')
const avatarText = computed(() => {
    const name = activeUser.username || activeUser.fullName || 'U'
    return name[0].toUpperCase()
})

const currentRouteName = computed(() => {
  const nameMap: Record<string, string> = {
    'Dashboard': '仪表盘',
    'Customers': '客户管理',
    'Deals': '交易管道',
    'Reports': '报表分析',
    'Settings': '系统设置',
    'Approvals': '审批中心',
    'Users': '用户管理'
  }
  return nameMap[route.name as string] || route.name
})

const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('isAuthenticated')
    message.success('已退出登录')
    router.push('/login')
}

const handleToProfile = () => {
    message.info('个人中心功能开发中')
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.user-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 0 12px;
    height: 64px; /* Match header height */
    transition: background-color 0.3s;
}

.user-trigger:hover {
    background-color: rgba(0, 0, 0, 0.025);
}

.user-name {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
}
</style>
