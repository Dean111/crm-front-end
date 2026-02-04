import apiClient from './config'

export interface Deal {
    id?: number
    title: string
    customerId: number
    customerName?: string
    amount: number
    stage: 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'
    probability?: number
    ownerName?: string
    expectedCloseDate?: string
    actualCloseDate?: string
    description?: string
    createdAt?: string
    updatedAt?: string
}

export interface DealResponse {
    success: boolean
    data: Deal | Deal[] | any
    total?: number
    message?: string
}

export const dealApi = {
    /**
     * 获取所有交易
     */
    getAll: (params?: {
        stage?: string
        openOnly?: boolean
    }): Promise<DealResponse> => {
        return apiClient.get('/deals', { params })
    },

    /**
     * 获取管道统计
     */
    getStatistics: (): Promise<DealResponse> => {
        return apiClient.get('/deals/statistics')
    },

    /**
     * 获取单个交易
     */
    getById: (id: number): Promise<DealResponse> => {
        return apiClient.get(`/deals/${id}`)
    },

    /**
     * 创建交易
     */
    create: (deal: Deal): Promise<DealResponse> => {
        return apiClient.post('/deals', deal)
    },

    /**
     * 更新交易
     */
    update: (id: number, deal: Deal): Promise<DealResponse> => {
        return apiClient.put(`/deals/${id}`, deal)
    },

    /**
     * 删除交易
     */
    delete: (id: number): Promise<DealResponse> => {
        return apiClient.delete(`/deals/${id}`)
    }
}
