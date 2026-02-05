<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <h1>SWISS CRM</h1>
        <p>企业级客户关系管理系统</p>
      </div>

      <a-card class="login-card" :bordered="false">
        <a-tabs v-model:activeKey="activeTab" centered>
          <a-tab-pane key="account" tab="账号登录">
            <a-form
              :model="formState"
              name="login"
              @finish="handleLogin"
              layout="vertical"
              class="login-form"
            >
              <a-alert v-if="error" :message="error" type="error" show-icon class="mb-4" />

              <a-form-item
                name="email"
                :rules="[{ required: true, message: '请输入邮箱或用户名！' }]"
              >
                <a-input v-model:value="formState.email" placeholder="邮箱 / 用户名" size="large">
                  <template #prefix>
                    <UserOutlined />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item
                name="password"
                :rules="[{ required: true, message: '请输入密码！' }]"
              >
                <a-input-password v-model:value="formState.password" placeholder="密码" size="large">
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </a-form-item>

              <div class="form-actions">
                <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
                <a class="forgot-link">忘记密码？</a>
              </div>

              <a-form-item>
                <a-button type="primary" html-type="submit" size="large" block :loading="isLoading">
                  登录
                </a-button>
              </a-form-item>

              <div class="other-login">
                <a-divider plain>其他登录方式</a-divider>
                <div class="icon-group">
                  <a-button shape="circle" size="large">
                    <template #icon><WechatOutlined /></template>
                  </a-button>
                  <a-button shape="circle" size="large">
                    <template #icon><AliwangwangOutlined /></template>
                  </a-button>
                  <a-button shape="circle" size="large">
                    <template #icon><GithubOutlined /></template>
                  </a-button>
                </div>
              </div>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-card>
      
      <div class="login-footer">
        <span>© 2026 Swiss CRM. All rights reserved.</span>
        <div style="margin-top: 8px; font-size: 12px; color: #999;">
          API: {{ apiBaseUrl }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/auth'
import { UserOutlined, LockOutlined, WechatOutlined, AliwangwangOutlined, GithubOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const activeTab = ref('account')
const isLoading = ref(false)
const error = ref('')

// 显示当前 API 地址用于调试
const apiBaseUrl = computed(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
console.log('🔗 Current API Base URL:', apiBaseUrl.value)

const formState = reactive({
  email: 'admin',
  password: 'password',
  remember: true
})

const handleLogin = async (values: any) => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await authApi.login({
      username: values.email,
      password: values.password
    })

    if (response && response.success) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      router.push('/dashboard')
    } else {
      error.value = (response && response.message) || '登录失败，请检查用户名和密码'
    }
  } catch (err: any) {
    console.error(err)
    error.value = err.message || '登录请求失败'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: #f0f2f5 url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg') no-repeat center 110px;
  background-size: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
}

.login-content {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 33px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 12px;
  }

  p {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    margin: 0;
  }
}

.login-card {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
  border-radius: 8px;
  
  :deep(.ant-card-body) {
    padding: 24px 40px;
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  color: #1890ff;
}

.mb-4 {
  margin-bottom: 16px;
}

.other-login {
  margin-top: 24px;
  
  .icon-group {
    display: flex;
    justify-content: center;
    gap: 16px;
    color: rgba(0, 0, 0, 0.45);
    
    :deep(.anticon) {
      font-size: 24px;
      cursor: pointer;
      transition: color 0.3s;
      
      &:hover {
        color: #1890ff;
      }
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 48px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}
</style>
