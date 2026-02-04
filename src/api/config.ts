import axios from 'axios'

// API基础URL - 从环境变量读取，支持内网访问
// 在 .env 文件中配置 VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

console.log('API Base URL:', API_BASE_URL)

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 可以在这里添加token
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        // 统一错误处理
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 未授权，跳转登录
                    localStorage.removeItem('isAuthenticated')
                    window.location.href = '/login'
                    break
                case 404:
                    console.error('资源不存在')
                    break
                case 500:
                    console.error('服务器错误')
                    break
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
