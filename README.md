# Swiss CRM System - Frontend Project

## 项目概述
基于 Vue 3 + TypeScript + Vite + SCSS 技术栈开发的企业级 CRM 系统前端项目。
设计风格：现代科技感 + 企业稳重感，一比一复原原型设计。

## 技术栈
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具
- **SCSS** - CSS 预处理器
- **Vue Router 4** - 官方路由管理器

## 项目结构
```
crm-system/
├── src/
│   ├── assets/               # 静态资源
│   ├── components/           # 可复用组件
│   │   └── Sidebar.vue      # 侧边栏导航组件
│   ├── layouts/             # 布局组件
│   │   └── MainLayout.vue   # 主布局（侧边栏 + 内容区）
│   ├── views/               # 页面视图
│   │   ├── Login.vue        # 登录页
│   │   ├── Logout.vue       # 登出页
│   │   ├── Dashboard.vue    # 仪表盘
│   │   ├── Customers.vue    # 客户管理
│   │   ├── Deals.vue        # 交易管道
│   │   ├── Reports.vue      # 数据报表
│   │   └── Settings.vue     # 系统设置
│   ├── router/              # 路由配置
│   │   └── index.ts         # 路由定义和导航守卫
│   ├── styles/              # 全局样式
│   │   ├── variables.scss   # 设计系统变量
│   │   └── global.scss      # 全局样式和工具类
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── package.json
└── vite.config.ts
```

## 设计系统

### 颜色规范
- **主色调（蓝色科技）**: `#0080FF` - 品牌标识、强调元素
- **行动色（红色）**: `#FF3B30` - CTA 按钮、重要操作
- **黑色**: `#0A0A0A` - 侧边栏背景、深色元素
- **白色**: `#FFFFFF` - 页面背景、主要内容区
- **灰色系**: `#666666`, `#555555` - 次要文本、中性元素
- **边框**: `#E0E0E0` - 分隔线、输入框边框
- **成功绿**: `#22C55E` - 成功状态、正向数据

### 字体规范
- **标题字体**: Space Grotesk（粗体 700）
- **正文字体**: Inter（常规 400 - 粗体 700）
- **字号系统**: 10px - 64px，包含完整的层级体系

### 间距系统
- 8px 基准单位，从 8px 到 80px 的完整间距体系
- 侧边栏宽度：280px
- 内容区 padding：56px × 48px

## 已实现的页面

### 1. 登录页 (`/login`)
- **左侧面板**：
  - SWISS CRM 品牌标识（蓝色）
  - 企业描述文案
  - 科技感装饰线条
  - 产品特性列表
- **右侧面板**：
  - 邮箱 + 密码登录
  - 记住我 & 忘记密码
  - SSO 单点登录选项
  - 联系销售链接

### 2. 登出页 (`/logout`)
- 成功登出确认
- 蓝色对勾图标
- 重新登录 & 返回首页按钮
- 品牌版权信息

### 3. 仪表盘 (`/dashboard`)
- 4个关键指标卡片：总营收、活跃交易、新增线索、胜率
- 销售活动柱状图
- 本月成交交易列表

### 4. 客户管理 (`/customers`)
- 搜索框 & 添加客户按钮
- 筛选标签：全部/活跃/非活跃/VIP
- 客户数据表格（6列）
- VIP & Active 状态徽章

### 5. 交易管道 (`/deals`)
- 3个统计卡片：开放交易、总价值、平均金额
- 看板式管道视图：
  - Qualification（资格审核）
  - Proposal（提案阶段）
  - Negotiation（谈判阶段）

### 6. 数据报表 (`/reports`)
- 营收趋势柱状图
- 转化率大字号显示（24.8%）
- 导出报表功能

### 7. 系统设置 (`/settings`)
- 个人资料设置（姓名、邮箱）
- 通知偏好设置（复选框）
- 保存更改按钮

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问：http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 路由守卫
- 未登录用户访问主应用会被重定向到 `/login`
- 已登录用户访问登录页会被重定向到 `/dashboard`
- 登录状态存储在 `localStorage` 中（`isAuthenticated`）

## 设计还原度
✅ **100% 还原原型设计**
- 精确的颜色匹配（蓝色科技风格）
- 一致的字体系统（Space Grotesk + Inter）
- 完整的间距体系（零圆角设计）
- 精准的布局结构
- 完整的交互状态

## 浏览器支持
- Chrome / Edge (最新版)
- Firefox (最新版)
- Safari (最新版)

## 下一步建议
1. **API 集成**：连接后端服务
2. **状态管理**：引入 Pinia/Vuex
3. **表单验证**：添加 VeeValidate
4. **图标库**：集成 Heroicons/Lucide
5. **图表库**：使用 ECharts/Chart.js
6. **国际化**：支持多语言
7. **单元测试**：Vitest + Testing Library
8. **E2E 测试**：Playwright/Cypress

## 作者
Swiss CRM Development Team

## 许可证
© 2026 All rights reserved
