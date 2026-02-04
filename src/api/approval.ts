import apiClient from './config'

export interface Approval {
    id?: number
    title: string
    type: string
    applicantId?: number
    applicantName?: string
    amount?: number
    currentStage?: string
    targetStage?: string
    status: string // PENDING, APPROVED, REJECTED
    createdAt?: string
    processedAt?: string
    dealId?: number
}

export const approvalApi = {
    getPending: (): Promise<Approval[]> => {
        return apiClient.get('/approvals/pending')
    },
    getHistory: (): Promise<Approval[]> => {
        return apiClient.get('/approvals/history')
    },
    getMy: (userId: number): Promise<Approval[]> => {
        return apiClient.get('/approvals/my', { params: { userId } })
    },
    create: (data: Partial<Approval>): Promise<Approval> => {
        return apiClient.post('/approvals', data)
    },
    process: (id: number, approved: boolean): Promise<any> => {
        return apiClient.post(`/approvals/${id}/process`, { approved })
    }
}
