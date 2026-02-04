<template>
  <a-modal
    :open="isOpen"
    :title="isEdit ? '编辑交易' : '创建新交易'"
    @ok="handleSubmit"
    @cancel="close"
    :confirmLoading="loading"
    width="500px"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="交易标题" name="title">
        <a-input v-model:value="form.title" placeholder="例如：软件开发合同" />
      </a-form-item>

      <a-form-item label="客户" name="customerId">
        <a-select
          v-model:value="form.customerId"
          show-search
          placeholder="选择或搜索客户"
          :filter-option="filterCustomerOption"
        >
          <a-select-option 
            v-for="customer in customers" 
            :key="customer.id" 
            :value="customer.id"
            :label="customer.name"
          >
            {{ customer.name }} ({{ customer.company || '无公司' }})
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="金额" name="amount">
            <a-input-number
              v-model:value="form.amount"
              :min="0"
              style="width: 100%"
              prefix="$"
            />
          </a-form-item>
        </a-col>
        
        <a-col :span="12">
          <a-form-item label="赢单概率 (%)" name="probability">
            <a-slider v-model:value="form.probability" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="阶段" name="stage">
        <a-select v-model:value="form.stage">
          <a-select-option value="QUALIFICATION">资格审查</a-select-option>
          <a-select-option value="PROPOSAL">方案报价</a-select-option>
          <a-select-option value="NEGOTIATION">商务谈判</a-select-option>
          <a-select-option value="WON">成交</a-select-option>
          <a-select-option value="LOST">丢单</a-select-option>
        </a-select>
      </a-form-item>
      
      <a-alert v-if="error" :message="error" type="error" show-icon class="mb-4" />
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { dealApi, type Deal } from '../api/deal'
import { customerApi, type Customer } from '../api/customer'
import type { FormInstance } from 'ant-design-vue';

const props = defineProps<{
  isOpen: boolean
  editData?: Deal | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const error = ref('')
const customers = ref<Customer[]>([])
const isEdit = ref(false)

const form = reactive({
  title: '',
  customerId: undefined as number | undefined,
  amount: 0,
  stage: 'QUALIFICATION',
  probability: 50
})

const rules = {
  title: [{ required: true, message: '请输入交易标题', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  stage: [{ required: true, message: '请选择阶段', trigger: 'change' }]
}

// 加载客户列表
const loadCustomers = async () => {
  try {
    const res = await customerApi.getAll()
    if (res.success) {
      if (Array.isArray(res.data)) {
        customers.value = res.data
      }
    }
  } catch (err) {
    console.error(err)
  }
}

// 监听数据变化
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadCustomers()
    if (props.editData) {
      isEdit.value = true // 编辑模式
      const data = props.editData
      form.title = data.title
      form.customerId = data.customerId
      form.amount = data.amount
      form.stage = data.stage as any
      form.probability = data.probability || 50
    } else {
      isEdit.value = false // 创建模式
      form.title = ''
      form.customerId = undefined
      form.amount = 0
      form.stage = 'QUALIFICATION'
      form.probability = 50
    }
    error.value = ''
  }
})

const filterCustomerOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validateFields()
    
    if (!form.customerId) {
        error.value = '请选择有效的客户'
        return
    }

    loading.value = true
    error.value = ''

    const payload: Partial<Deal> = {
      title: form.title,
      customerId: form.customerId,
      amount: form.amount,
      stage: form.stage as any,
      probability: form.probability,
      ownerName: 'Admin'
    }

    let response
    if (isEdit.value && props.editData?.id) {
       response = await dealApi.update(props.editData.id, payload as Deal)
    } else {
       response = await dealApi.create(payload as Deal)
    }

    if (response.success) {
      emit('success')
      close()
    } else {
      error.value = response.message || '操作失败'
    }
  } catch (err: any) {
     if (err.errorFields) {
      // 验证错误
    } else {
      console.error(err)
      error.value = err.message || '系统错误'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mb-4 {
  margin-top: 16px;
}
</style>
