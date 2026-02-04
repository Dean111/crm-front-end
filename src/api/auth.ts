import axios from './config'

export interface User {
    id: number
    username: string
    fullName: string
    email: string
    role: string
}

export interface LoginResponse {
    success: boolean
    token: string
    user: User
    message?: string
}

export const authApi = {
    login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
        try {
            console.log('Sending login request:', credentials)
            const response = await axios.post<LoginResponse>('/auth/login', credentials)
            console.log('Login response:', response)
            if (!response) {
                throw new Error('No data received from server')
            }
            // axios 拦截器已经返回了 response.data，所以这里 response 就是 LoginResponse
            return response as unknown as LoginResponse
        } catch (error: any) {
            console.error('Login error in api:', error)
            if (error.response?.data) {
                console.log('Returning error data:', error.response.data)
                return error.response.data
            }
            // 构造一个默认的失败响应，防止上层读取 undefined
            return {
                success: false,
                token: '',
                user: {} as any,
                message: error.message || 'Network Error'
            }
        }
    }
}
