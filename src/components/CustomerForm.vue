<template>
  <a-modal
    :open="isOpen"
    :title="isEdit ? '编辑客户' : '新增客户'"
    @ok="handleSubmit"
    @cancel="close"
    :confirmLoading="loading"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      layout="vertical"
      name="customerForm"
    >
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="姓名" name="name">
            <a-input v-model:value="form.name" placeholder="请输入客户姓名" />
          </a-form-item>
        </a-col>
        
        <a-col :span="24">
          <a-form-item label="邮箱" name="email">
            <a-input v-model:value="form.email" placeholder="请输入邮箱地址" />
          </a-form-item>
        </a-col>
        
        <a-col :span="12">
          <a-form-item label="公司" name="company">
            <a-input v-model:value="form.company" placeholder="请输入公司名称" />
          </a-form-item>
        </a-col>
        
        <a-col :span="12">
          <a-form-item label="电话" name="phone">
            <a-input v-model:value="form.phone" placeholder="请输入电话号码" />
          </a-form-item>
        </a-col>
        
        <a-col :span="24" v-if="isEdit">
          <a-form-item label="状态" name="status">
            <a-select v-model:value="form.status">
              <a-select-option value="ACTIVE">活跃</a-select-option>
              <a-select-option value="INACTIVE">非活跃</a-select-option>
              <a-select-option value="VIP">VIP</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-alert v-if="error" :message="error" type="error" show-icon class="mb-4" />
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRaw } from 'vue'
import { customerApi, type Customer } from '../api/customer'
import type { FormInstance } from 'ant-design-vue';

const props = defineProps<{
  isOpen: boolean
  editData?: Customer | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const isEdit = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive<Customer>({
  name: '',
  email: '',
  company: '',
  phone: '',
  status: 'ACTIVE'
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.company = ''
  form.phone = ''
  form.status = 'ACTIVE'
  delete form.id
  error.value = ''
  // 暂时不重置验证状态以免打开时报错，或者在nextTick重置
}

watch(() => props.editData, (newVal) => {
  if (newVal) {
    isEdit.value = true
    Object.assign(form, newVal)
  } else {
    isEdit.value = false
    resetForm()
  }
}, { immediate: true })

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validateFields()
    
    loading.value = true
    error.value = ''

    let response
    const payload = toRaw(form)
    
    if (isEdit.value && payload.id) {
      response = await customerApi.update(payload.id, payload)
    } else {
      response = await customerApi.create(payload)
    }

    if (response.success) {
      emit('success')
      close()
    } else {
      error.value = response.message || '操作失败'
    }
  } catch (err: any) {
    // 验证失败或API错误
    if (err.errorFields) {
      // 验证错误，忽略
    } else {
      console.error('Save error:', err)
      error.value = err.response?.data?.message || err.message || '保存失败'
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
