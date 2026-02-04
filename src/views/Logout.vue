<template>
  <div class="logout-container">
    <a-result
      status="success"
      title="您已成功退出登录"
      sub-title="感谢使用 Swiss CRM 系统，您的会话已安全结束。"
    >
      <template #extra>
        <a-button key="console" type="primary" @click="handleLogin">重新登录</a-button>
        <a-button key="buy" @click="handleHome">返回首页</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
})

const handleLogin = () => {
  router.push('/login')
}

const handleHome = () => {
  router.push('/')
}
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
</style>
