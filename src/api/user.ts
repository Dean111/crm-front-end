import apiClient from './config'

export interface User {
    id?: number
    username: string
    email: string
    role: string
    isActive?: boolean // 对应后端的 isActive
    status?: string // 前端展示用的状态文本
    fullName?: string
    lastLoginAt?: string
    password?: string
}

export const userApi = {
    getAll: (): Promise<User[]> => {
        return apiClient.get('/users')
    },
    create: (data: User): Promise<User> => {
        return apiClient.post('/users', data)
    },
    update: (id: number, data: Partial<User>): Promise<User> => {
        return apiClient.put(`/users/${id}`, data)
    }
}
