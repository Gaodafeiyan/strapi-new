# 注册和邀请码系统迁移说明

## 概述
本系统已从 `strapi-backend-skeleton` 迁移了完整的注册和邀请码逻辑到 `strapi-new`，保持了所有拼音字段命名和功能完整性。

## 功能特性

### 1. 邀请码注册系统
- **路由**: `POST /auth/invite-register`
- **功能**: 通过邀请码注册新用户
- **参数**:
  - `username`: 用户名（3-20位）
  - `email`: 邮箱地址
  - `password`: 密码（至少6位）
  - `inviteCode`: 邀请码（8-10位大写字母和数字）

### 2. 初始管理员创建
- **路由**: `POST /auth/create-first-admin`
- **功能**: 创建系统第一个管理员用户
- **参数**:
  - `username`: 用户名（3-20位）
  - `email`: 邮箱地址
  - `password`: 密码（至少6位）

### 3. 用户钱包自动创建
- 每个新用户注册时自动创建钱包
- 包含 `usdtYue`、`aiYue`、`aiTokenBalances` 字段
- 初始余额为 0

## 权限管理
- 新注册用户自动分配 `authenticated` 角色
- 初始管理员分配 `admin` 角色
- 确保权限不丢失

## 安全特性
- 输入验证和清理
- 密码自动加密（Strapi内置）
- 邀请码唯一性验证
- 用户名和邮箱重复检查

## 使用流程

### 1. 系统初始化
```bash
# 创建第一个管理员用户
POST /auth/create-first-admin
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "123456"
}
```

### 2. 用户注册
```bash
# 使用邀请码注册
POST /auth/invite-register
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "123456",
  "inviteCode": "ABC123DEF"
}
```

## 文件结构
```
strapi-new/
├── src/api/auth/
│   ├── controllers/auth.ts          # 注册控制器
│   └── routes/auth.ts               # 注册路由
├── src/api/qianbao-yue/             # 钱包模块
├── src/extensions/users-permissions/
│   └── content-types/user/schema.json # 用户模型扩展
└── utils/
    ├── validation.ts                # 验证函数
    └── invite.ts                    # 邀请码生成
```

## 注意事项
1. 确保 Strapi 已安装 `users-permissions` 插件
2. 首次使用需要创建管理员用户
3. 邀请码格式：8-10位大写字母和数字
4. 所有字段保持拼音命名，便于维护 