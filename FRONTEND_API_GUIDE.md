# 前端API集成说明文档

## 📦 已安装的依赖

```bash
npm install axios
```

## 🗂️ API目录结构

```
src/api/
├── config.ts        # Axios配置和拦截器
├── customer.ts      # 客户相关API
└── deal.ts          # 交易相关API
```

## 🔧 API配置 (config.ts)

### 基础配置
- **Base URL**: `http://localhost:8080/api`
- **Timeout**: 10秒
- **Content-Type**: `application/json`

### 请求拦截器
- 自动添加Authorization Token（如果存在）
- Token从 `localStorage.getItem('authToken')` 获取

### 响应拦截器
- 自动提取 `response.data`
- 统一错误处理：
  - **401**: 未授权，清除登录状态并跳转登录页
  - **404**: 资源不存在
  - **500**: 服务器错误

## 📡 Customer API (customer.ts)

### 接口列表

#### 1. 获取所有客户
```typescript
customerApi.getAll(params?: {
  status?: string       // 'VIP' | 'ACTIVE' | 'INACTIVE'
  keyword?: string      // 搜索关键词
  page?: number        // 页码
  size?: number        // 每页数量
  sort?: string        // 排序规则
})
```

**示例**:
```typescript
// 获取所有客户
const response = await customerApi.getAll()

// 筛选VIP客户
const vipCustomers = await customerApi.getAll({ status: 'VIP' })

// 搜索客户
const searchResult = await customerApi.getAll({ keyword: 'Acme' })

// 分页查询
const page1 = await customerApi.getAll({ page: 0, size: 20 })
```

#### 2. 获取单个客户
```typescript
customerApi.getById(id: number)
```

**示例**:
```typescript
const customer = await customerApi.getById(1)
console.log(customer.data.name)
```

#### 3. 创建客户
```typescript
customerApi.create(customer: Customer)
```

**示例**:
```typescript
const newCustomer = await customerApi.create({
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Corp',
  status: 'ACTIVE'
})
```

#### 4. 更新客户
```typescript
customerApi.update(id: number, customer: Customer)
```

**示例**:
```typescript
const updated = await customerApi.update(1, {
  name: 'John Doe Updated',
  email: 'john@example.com',
  status: 'VIP'
})
```

#### 5. 删除客户
```typescript
customerApi.delete(id: number)
```

**示例**:
```typescript
await customerApi.delete(1)
```

## 💼 Deal API (deal.ts)

### 接口列表

#### 1. 获取所有交易
```typescript
dealApi.getAll(params?: {
  stage?: string        // 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION'
  openOnly?: boolean    // 只显示开放交易
})
```

**示例**:
```typescript
// 获取所有交易
const allDeals = await dealApi.getAll()

// 获取开放交易
const openDeals = await dealApi.getAll({ openOnly: true })

// 按阶段筛选
const qualifyDeals = await dealApi.getAll({ stage: 'QUALIFICATION' })
```

#### 2. 获取管道统计
```typescript
dealApi.getStatistics()
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "openDeals": 42,
    "totalValue": 1200000.00,
    "avgDealSize": 28571.43
  }
}
```

**示例**:
```typescript
const stats = await dealApi.getStatistics()
console.log(`开放交易: ${stats.data.openDeals}`)
console.log(`总价值: $${stats.data.totalValue}`)
```

#### 3. 获取单个交易
```typescript
dealApi.getById(id: number)
```

#### 4. 创建交易
```typescript
dealApi.create(deal: Deal)
```

**示例**:
```typescript
const newDeal = await dealApi.create({
  title: 'Enterprise Plan',
  customerId: 1,
  amount: 45000,
  stage: 'QUALIFICATION',
  probability: 60,
  ownerName: 'Sales Team'
})
```

#### 5. 更新交易
```typescript
dealApi.update(id: number, deal: Deal)
```

#### 6. 删除交易
```typescript
dealApi.delete(id: number)
```

## 📝 TypeScript类型定义

### Customer类型
```typescript
interface Customer {
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
```

### Deal类型
```typescript
interface Deal {
  id?: number
  title: string
  customerId: number
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
```

## 🔄 在组件中使用API

### 示例：加载客户列表

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { customerApi, type Customer } from '@/api/customer'

const customers = ref<Customer[]>([])
const loading = ref(false)
const error = ref('')

const loadCustomers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await customerApi.getAll()
    
    if (response.success) {
      customers.value = Array.isArray(response.data) 
        ? response.data 
        : [response.data]
    } else {
      error.value = response.message || 'Failed to load'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Network error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCustomers()
})
</script>
```

## 🎯 最佳实践

### 1. 错误处理
```typescript
try {
  const response = await customerApi.getAll()
  // 处理成功响应
} catch (err: any) {
  // 处理错误
  console.error('API Error:', err)
  
  if (err.response) {
    // 服务器返回错误
    const message = err.response.data.message
    alert(message)
  } else if (err.request) {
    // 请求发出但无响应
    alert('Network error. Please check your connection.')
  } else {
    // 其他错误
    alert('An error occurred')
  }
}
```

### 2. Loading状态
```typescript
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const data = await someApi.getData()
    // 处理数据
  } finally {
    loading.value = false
  }
}
```

### 3. 并行请求
```typescript
const loadDashboard = async () => {
  try {
    // 同时发起多个请求
    const [stats, deals, customers] = await Promise.all([
      dealApi.getStatistics(),
      dealApi.getAll(),
      customerApi.getAll()
    ])
    
    // 处理所有响应
  } catch (err) {
    // 统一错误处理
  }
}
```

## 🔐 认证流程

### 添加Token
```typescript
// 登录成功后保存token
localStorage.setItem('authToken', 'your-jwt-token')
localStorage.setItem('isAuthenticated', 'true')

// axios会自动在请求头中添加
// Authorization: Bearer your-jwt-token
```

### 登出
```typescript
// 清除token
localStorage.removeItem('authToken')
localStorage.removeItem('isAuthenticated')

// 跳转登录页
router.push('/login')
```

## 🐛 调试技巧

### 1. 查看请求详情
打开浏览器开发者工具 → Network标签 → 查看XHR请求

### 2. 后端是否运行
```bash
# 测试后端是否可访问
curl http://localhost:8080/api/customers

# 或在浏览器直接访问
http://localhost:8080/api/customers
```

### 3. CORS问题
确保后端已配置CORS允许前端域名：
- `http://localhost:5173` (Vite开发服务器)

## ⚠️ 常见错误

### 错误1: Network Error
**原因**: 后端未启动或端口不对  
**解决**: 
```bash
cd crm-backend
mvn spring-boot:run
# 确认运行在 http://localhost:8080
```

### 错误2: 401 Unauthorized
**原因**: Token无效或过期  
**解决**: 重新登录获取新token

### 错误3: CORS Error
**原因**: 跨域配置不正确  
**解决**: 检查后端 `WebConfig.java` 的CORS配置

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "total": 100
}
```

### 错误响应
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 🚀 已集成页面

✅ **Dashboard.vue** - 展示统计数据和最近交易  
✅ **Customers.vue** - 客户列表、搜索、筛选  
✅ **Deals.vue** - 交易管道、统计数据  
⏳ **Reports.vue** - 待连接API  
⏳ **Settings.vue** - 待连接API  

## 📞 技术支持

遇到问题？
1. 检查后端是否运行
2. 查看浏览器Console错误
3. 查看Network请求详情
4. 参考 `crm-backend/API_TESTING.md`

---

**文档版本**: v1.0  
**最后更新**: 2026-02-02
