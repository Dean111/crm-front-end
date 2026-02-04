# 环境变量配置说明

## 文件说明

- **`.env`**: 默认配置，使用内网 IP，适合团队开发
- **`.env.local`**: 本地覆盖配置，优先级最高，不会提交到 Git

## 当前配置

```bash
# 内网访问地址（其他设备可访问）
VITE_API_BASE_URL=http://192.168.103.99:8080/api
```

## 使用场景

### 1. 本机开发（只需本机访问）
创建或修改 `.env.local`：
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. 内网测试（其他设备访问）
使用默认的 `.env` 配置即可（已配置为 192.168.103.99）

### 3. 生产部署
修改 `.env` 为实际服务器地址：
```bash
VITE_API_BASE_URL=https://your-domain.com/api
```

## 重要提示

⚠️ **修改环境变量后必须重启 Vite 开发服务器！**

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

## 验证配置

启动后，浏览器控制台会输出：
```
API Base URL: http://192.168.103.99:8080/api
```
