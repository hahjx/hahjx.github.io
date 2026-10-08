# Spring Boot 请求参数接收与 Content-Type 终极指南

## 1. Spring Boot 注解与传参方式对照表

Spring Boot 接收参数的核心原则是：**根据"数据在哪里"来匹配对应的注解**。

| 数据位置 | 典型示例 | 对应注解 | 代码示例 |
| :--- | :--- | :--- | :--- |
| **URL 路径中** (RESTful) | `/dish/100` | `@PathVariable` | `getById(@PathVariable Long id)` |
| **URL 问号后** (Query String) | `/list?page=1&size=10` | `@RequestParam` | `list(@RequestParam Integer page)` |
| **请求体 Body 中** (JSON) | `{"name":"水煮肉片"}` | `@RequestBody` | `save(@RequestBody DishDTO dto)` |
| **请求体 Body 中** (表单) | `name=水煮肉片&price=10` | **无注解** (直接接实体类) | `save(DishDTO dto)` |

> **避坑指南：**
> - 看到 URL 带花括号 `{id}` → 必用 `@PathVariable`。
> - 看到 URL 带问号 `?key=value` → 必用 `@RequestParam`。
> - 看到 DevTools 中 Content-Type 为 `application/json` → 必用 `@RequestBody`。
> - 看到 DevTools 中 Content-Type 为 `application/x-www-form-urlencoded` → **千万不要加** `@RequestBody`，直接写实体类即可。

---

## 2. Content-Type 与请求体格式解析

`Content-Type` 本质上是前端告诉后端："我发过来的这个包裹（请求体）里装的是什么格式的数据"。

### 开发中必知的 3 种核心类型

| Content-Type | 请求体长什么样 | 后端如何接收 | 典型场景 |
| :--- | :--- | :--- | :--- |
| `application/json` | `{"name":"张三","age":20}` | `@RequestBody` | 前后端分离项目主流，Vue/React 发请求 |
| `application/x-www-form-urlencoded` | `name=张三&age=20` | 直接接实体类 / `@RequestParam` | 传统 HTML 表单提交、简单登录接口 |
| `multipart/form-data` | 包含二进制文件流 | `@RequestParam` + `MultipartFile` | 上传图片、视频、带文件的复杂表单 |

### 常见误区澄清

**Q：`x-www-form-urlencoded` 和直接在 URL 里写 `&xxx=1` 一样吗？**

**A：不完全一样。**

- **长得像**：它们的格式都是 `key=value&key2=value2`。
- **位置不同**：URL 拼接是在地址栏（Query String），通常用于 GET 请求；`x-www-form-urlencoded` 是在请求体（Body）里，通常用于 POST 请求，地址栏看不到，且能传输更多数据。
- **后端接收**：在 Spring Boot 中，这两种情况通常都可以使用 `@RequestParam` 或直接使用实体类接收。

**Q：放在请求体里是不是都用 `@RequestBody`？**

**A：不是！**

只有当请求体是 **JSON 格式** (`application/json`) 时才用 `@RequestBody`。如果是表单格式 (`x-www-form-urlencoded`) 或文件上传 (`multipart/form-data`)，加了 `@RequestBody` 反而会报错（通常报 415 或 400 错误）。
