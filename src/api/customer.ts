import apiClient from './config'

export interface Customer {
    id?: number
    name: string
    email: string
    company?: string
    phone?: string
    address?: string
    status: 'VIP' | 'ACTIVE' | 'INACTIVE'
    totalDeals?: number
    totalValue?: string
    createdAt?: string
    updatedAt?: string
}

export interface CustomerResponse {
    success: boolean
    data: Customer | Customer[]
    total?: number
    page?: number
    size?: number
    totalPages?: number
    message?: string
}

export const customerApi = {
    /**
     * 获取所有客户
     */
    getAll: (params?: {
        status?: string
        keyword?: string
        page?: number
        size?: number
        sort?: string
    }): Promise<CustomerResponse> => {
        return apiClient.get('/customers', { params })
    },

    /**
     * 获取单个客户
     */
    getById: (id: number): Promise<CustomerResponse> => {
        return apiClient.get(`/customers/${id}`)
    },

    /**
     * 创建客户
     */
    create: (customer: Customer): Promise<CustomerResponse> => {
        return apiClient.post('/customers', customer)
    },

    /**
     * 更新客户
     */
    update: (id: number, customer: Customer): Promise<CustomerResponse> => {
        return apiClient.put(`/customers/${id}`, customer)
    },

    /**
     * 删除客户
     */
    delete: (id: number): Promise<CustomerResponse> => {
        return apiClient.delete(`/customers/${id}`)
    }
}
