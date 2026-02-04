# 🔍 Network Error 排查清单

## 问题现象
内网其他 IP 登录系统时提示：`Network Error`

## ✅ 已完成的修复

1. ✅ 后端 CORS 配置已开启 `allow-all: true`
2. ✅ 前端 API 地址已改为 `http://192.168.103.99:8080/api`
3. ✅ Vite 开发服务器已重启
4. ✅ 后端服务运行正常（端口 8080 监听中）

## 🔍 排查步骤

### 1. 验证前端是否加载了正确的 API 地址

打开浏览器访问：`http://192.168.103.99:5173`

按 F12 打开开发者工具，在 Console 标签页应该看到：
```
API Base URL: http://192.168.103.99:8080/api
```

**如果看到的是 `localhost`，说明环境变量没有生效！**

### 2. 清除浏览器缓存

- 按 `Ctrl + Shift + Delete` 清除缓存
- 或者按 `Ctrl + F5` 强制刷新

### 3. 检查网络请求

在开发者工具的 Network 标签页：
- 查看登录请求的 URL 是否是 `http://192.168.103.99:8080/api/auth/login`
- 如果是 `http://localhost:8080/api/auth/login` 说明前端没有更新

### 4. 验证后端可访问性

在**访问的客户端机器**上打开浏览器，访问：
```
http://192.168.103.99:8080/api/auth/login
```

应该看到类似的响应（405 或 400 错误是正常的，说明服务可访问）

### 5. 防火墙检查

在服务器上运行（PowerShell 管理员）：
```powershell
# 检查防火墙规则
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*8080*"}

# 如果没有规则，添加：
New-NetFirewallRule -DisplayName "CRM Backend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "CRM Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

## 🐛 常见问题

### Q: 控制台显示 `localhost` 而不是 `192.168.103.99`
**A:** 环境变量没有生效，需要：
1. 确认 `.env` 文件内容正确
2. 完全停止 Vite（Ctrl+C）
3. 重新运行 `npm run dev`

### Q: 本机访问正常，其他设备访问失败
**A:** 可能是防火墙问题，需要开放 5173 和 8080 端口

### Q: Network Error 但后端日志没有请求记录
**A:** 请求根本没到达后端，检查：
1. 客户端能否 ping 通 `192.168.103.99`
2. 防火墙是否阻止了连接
3. 前端请求的 URL 是否正确

## 📝 当前配置

- **前端地址**: http://192.168.103.99:5173
- **后端地址**: http://192.168.103.99:8080/api
- **CORS**: 允许所有来源
- **环境变量**: VITE_API_BASE_URL=http://192.168.103.99:8080/api
