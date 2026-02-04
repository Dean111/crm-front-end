<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>管理您的账户设置和全局偏好</p>
    </div>

    <a-card :bordered="false" class="settings-card">
      <a-tabs v-model:activeKey="activeKey" tab-position="left" class="settings-tabs">
        
        <!-- 1. 个人资料 -->
        <a-tab-pane key="profile" tab="个人资料">
          <div class="tab-content">
            <h2 class="section-title">基本信息</h2>
            
            <div class="profile-header">
               <a-upload
                  name="avatar"
                  list-type="picture-card"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  @change="handleAvatarChange"
                >
                  <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
                  <div v-else>
                    <loading-outlined v-if="loading" />
                    <plus-outlined v-else />
                    <div class="ant-upload-text">更换头像</div>
                  </div>
                </a-upload>
                <div class="profile-tip">
                   <h3>{{ formState.nickname || 'Admin' }}</h3>
                   <p>支持 JPG, PNG 格式，文件小于 2MB</p>
                </div>
            </div>

            <a-form layout="vertical" :model="formState" class="setting-form">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="昵称" name="nickname">
                    <a-input v-model:value="formState.nickname" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="职位" name="title">
                     <a-input v-model:value="formState.title" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="个人简介" name="bio">
                    <a-textarea v-model:value="formState.bio" :rows="4" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="联系邮箱" name="email">
                     <a-input v-model:value="formState.email" disabled />
                  </a-form-item>
                </a-col>
                 <a-col :span="12">
                  <a-form-item label="手机号码" name="phone">
                     <a-input v-model:value="formState.phone" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-form-item>
                <a-button type="primary" @click="saveProfile" :loading="saving">保存更改</a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- 2. 账号安全 -->
        <a-tab-pane key="security" tab="账号安全">
           <div class="tab-content">
             <h2 class="section-title">安全设置</h2>
             
             <a-list item-layout="horizontal" :data-source="securitySettings">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <template #actions>
                      <a-button type="link" @click="item.action">{{ item.actionText }}</a-button>
                    </template>
                    <a-list-item-meta :description="item.description">
                      <template #title>
                        {{ item.title }}
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
           </div>
        </a-tab-pane>

        <!-- 3. 通知偏好 -->
        <a-tab-pane key="notification" tab="通知偏好">
           <div class="tab-content">
             <h2 class="section-title">消息通知</h2>
             <a-list item-layout="horizontal" :data-source="notificationSettings">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <template #actions>
                       <a-switch v-model:checked="item.enabled" />
                    </template>
                    <a-list-item-meta :description="item.description">
                      <template #title>{{ item.title }}</template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
           </div>
        </a-tab-pane>

        <!-- 4. 团队管理 -->
        <a-tab-pane key="team" tab="团队管理">
           <div class="tab-content">
             <div class="flex-between mb-4">
                <h2 class="section-title" style="margin:0">成员列表</h2>
                <a-button type="primary">
                  <template #icon><UserAddOutlined /></template>邀请成员
                </a-button>
             </div>
             
             <a-table :dataSource="teamMembers" :columns="teamColumns" :pagination="false">
                <template #bodyCell="{ column, record }">
                   <template v-if="column.key === 'role'">
                      <a-tag :color="record.role === 'Admin' ? 'blue' : 'default'">{{ record.role }}</a-tag>
                   </template>
                   <template v-else-if="column.key === 'status'">
                      <a-badge :status="record.status === 'Online' ? 'success' : 'default'" :text="record.status" />
                   </template>
                   <template v-else-if="column.key === 'action'">
                      <a-button type="link" danger v-if="record.role !== 'Admin'">移除</a-button>
                      <a-button type="link" v-else disabled>移除</a-button>
                   </template>
                </template>
             </a-table>
           </div>
        </a-tab-pane>

      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, LoadingOutlined, UserAddOutlined } from '@ant-design/icons-vue'
import type { UploadChangeParam } from 'ant-design-vue'

const activeKey = ref('profile')
const saving = ref(false)
const loading = ref(false)
const imageUrl = ref<string>('')

// 1. 个人资料数据
const formState = reactive({
  nickname: 'Admin User',
  title: '销售总监',
  email: 'admin@swisscrm.com',
  phone: '13800138000',
  bio: '负责华东区销售业务管理与团队建设。'
})

// 2. 安全设置数据
const securitySettings = ref([
  {
    title: '账户密码',
    description: '当前密码强度：强',
    actionText: '修改',
    action: () => message.info('打开修改密码弹窗')
  },
  {
    title: '密保手机',
    description: '已绑定手机：138****8000',
    actionText: '更换',
    action: () => {}
  },
  {
    title: 'MFA 设备',
    description: '未绑定 MFA 设备，绑定后可进行二次确认',
    actionText: '绑定',
    action: () => {}
  }
])

// 3. 通知设置数据
const notificationSettings = ref([
  { title: '账户消息', description: '账户变动、安全告警等通知', enabled: true },
  { title: '待办任务', description: '每日待办任务提醒', enabled: true },
  { title: '系统公告', description: '系统升级、功能更新公告', enabled: false },
])

// 4. 团队成员数据 (Mock)
const teamMembers = ref([
  { id: 1, name: 'Admin User', email: 'admin@swisscrm.com', role: 'Admin', status: 'Online' },
  { id: 2, name: 'Sarah Wilson', email: 'sarah@swisscrm.com', role: 'Sales', status: 'Offline' },
  { id: 3, name: 'Tom Hanks', email: 'tom@swisscrm.com', role: 'Sales', status: 'Online' },
])

const teamColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' },
]

// 头像上传逻辑
const beforeUpload = (file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const handleAvatarChange = (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    // Get this url from response in real world.
    imageUrl.value = 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png'; 
    loading.value = false;
  }
};

const saveProfile = async () => {
  saving.value = true
  // Mock API call
  setTimeout(() => {
    saving.value = false
    message.success('个人资料已更新')
  }, 1000)
}
</script>

<style scoped lang="scss">
.settings-page {
  .page-header {
    margin-bottom: 24px;
    h1 { font-size: 24px; font-weight: 500; margin-bottom: 8px; }
    p { color: #8c8c8c; }
  }

  .settings-card {
    min-height: 600px;
    
    :deep(.ant-card-body) {
      padding: 0;
    }
  }

  .settings-tabs {
    :deep(.ant-tabs-nav) {
      width: 220px;
    }
    
    :deep(.ant-tabs-content) {
      padding: 24px 40px;
      padding-left: 24px; 
      border-left: 1px solid #f0f0f0;
      min-height: 600px;
    }
  }
  
  .section-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 24px;
    color: rgba(0,0,0,0.85);
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 32px;
    
    .profile-tip {
       h3 { margin: 0 0 4px; font-size: 18px; font-weight: 500;}
       p { color: #8c8c8c; margin: 0; }
    }
  }

  .setting-form {
    max-width: 600px;
  }
  
  .avatar-uploader {
    :deep(.ant-upload) {
      width: 100px;
      height: 100px;
    }
    
     img {
        width: 100%;
        height: 100%;
        object-fit: cover;
     }
  }
  
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .mb-4 { margin-bottom: 16px; }
}
</style>
