# 在线商城后台管理系统

基于 **Spring Boot + Vue 3 + Element Plus** 的现代化商城后台管理系统。

## 🚀 技术栈

### 后端
- Spring Boot 2.6.13
- Spring Security + JWT 认证
- Spring Data JPA
- MySQL 5.5+ / 8.x
- Redis 缓存
- Swagger 接口文档

### 前端
- Vue 3 + Vite
- Element Plus
- Vue Router + Vuex
- Axios

## 📦 环境要求

| 组件 | 版本要求 |
|------|----------|
| JDK | 1.8+ |
| MySQL | 5.5+ 或 8.x |
| Redis | 3.0+ |
| Node.js | 16+ |
| Maven | 3.6+ |

## ⚙️ 快速开始

### 1. 克隆项目

```bash
git clone <项目地址>
cd 在线商城后台管理系统
```

### 2. 配置数据库

#### 2.1 创建数据库

```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8 COLLATE utf8_general_ci;
```

#### 2.2 修改数据库配置

编辑 `demo/src/main/resources/application.properties`：

```properties
# 修改为你的数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?useSSL=false&useUnicode=true&characterEncoding=utf8
spring.datasource.username=你的用户名
spring.datasource.password=你的密码
```

**MySQL 版本适配说明：**
- MySQL 5.5/5.6：保持默认配置 `MySQL5InnoDBDialect`
- MySQL 5.7/8.x：可选使用 `MySQL8Dialect`（更推荐保持默认，兼容性好）

### 3. 配置 Redis

确保 Redis 已启动：

```bash
# Windows
redis-server

# Linux/Mac
redis-server /usr/local/etc/redis.conf
```

如果没有 Redis，可以在配置文件中禁用缓存（项目会自动降级为无缓存模式）。

### 4. 启动后端

```bash
cd demo
mvn clean compile
mvn spring-boot:run
```

后端启动后访问：
- API 服务：http://localhost:8080
- Swagger 文档：http://localhost:8080/swagger-ui.html

### 5. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端启动后访问：http://localhost:5173

## 🔑 默认账户

| 账户类型 | 用户名 | 密码 |
|----------|--------|------|
| 管理员 | admin | 123456 |

## 📁 项目结构

```
├── demo/                          # 后端 Spring Boot 项目
│   ├── src/main/java/
│   │   └── com/example/demo/
│   │       ├── config/            # 配置类
│   │       ├── controller/        # 控制器
│   │       ├── model/             # 实体类
│   │       ├── repository/        # 数据访问层
│   │       ├── security/          # 安全配置
│   │       └── service/           # 业务逻辑层
│   └── src/main/resources/
│       ├── application.properties # 配置文件
│       └── data.sql               # 初始化数据
│
└── frontend/                      # 前端 Vue 3 项目
    ├── src/
    │   ├── api/                   # API 接口
    │   ├── router/                # 路由配置
    │   ├── store/                 # 状态管理
    │   └── views/                 # 页面组件
    └── vite.config.js             # Vite 配置
```

## 🎯 功能模块

- ✅ 用户登录/登出（JWT 认证）
- ✅ 商品管理（CRUD、库存、价格）
- ✅ 分类管理
- ✅ 订单管理（状态流转、物流信息）
- ✅ 用户管理（仅管理员）
- ✅ 促销管理（优惠券、折扣）
- ✅ 评价管理
- ✅ 数据报表（销售统计、热销商品）

## ❓ 常见问题

### Q1: 中文乱码怎么解决？

确保数据库使用 UTF-8 编码创建：
```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8 COLLATE utf8_general_ci;
```

### Q2: Redis 连接失败怎么办？

1. 确认 Redis 服务已启动
2. 检查 `application.properties` 中的 Redis 配置
3. 如果没有 Redis，项目会自动降级（不影响核心功能）

### Q3: 数据不显示或显示异常？

清除 Redis 缓存后刷新页面。

## 📝 开发者

- 作者：默默无闻的小哥
- 学校：某学校
- 联系方式：某邮箱

## 📄 许可证

本项目仅供学习交流使用。
