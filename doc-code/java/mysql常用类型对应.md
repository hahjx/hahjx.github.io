# MySQL 常用数据类型与 Java 类型对应关系

## 1. 数值类型

| MySQL 类型               | 说明                             | Java 常用类型         |
| ------------------------ | -------------------------------- | --------------------- |
| `BOOLEAN` / `TINYINT(1)` | 布尔值，0 为 false，非 0 为 true | `Boolean` / `Integer` |
| `TINYINT`                | 极小整数                         | `Integer`             |
| `SMALLINT`               | 小整数                           | `Integer`             |
| `INT` / `INTEGER`        | 普通整数                         | `Integer`             |
| `BIGINT`                 | 大整数                           | `Long`                |
| `FLOAT`                  | 单精度浮点数                     | `Float`               |
| `DOUBLE`                 | 双精度浮点数                     | `Double`              |
| `DECIMAL(M,D)`           | 精确小数，适合金额               | `BigDecimal`          |

## 2. 字符串类型

| MySQL 类型   | 说明           | Java 常用类型 |
| ------------ | -------------- | ------------- |
| `CHAR(N)`    | 固定长度字符串 | `String`      |
| `VARCHAR(N)` | 可变长度字符串 | `String`      |
| `TEXT`       | 较长文本       | `String`      |
| `BLOB`       | 二进制数据     | `byte[]`      |

## 3. 日期时间类型

| MySQL 类型  | 说明     | Java 常用类型                          |
| ----------- | -------- | -------------------------------------- |
| `DATE`      | 日期     | `LocalDate` / `java.sql.Date`          |
| `TIME`      | 时间     | `LocalTime` / `java.sql.Time`          |
| `DATETIME`  | 日期时间 | `LocalDateTime` / `java.sql.Timestamp` |
| `TIMESTAMP` | 时间戳   | `LocalDateTime` / `java.sql.Timestamp` |

# MySQL 与 Java 类型完整对应及开发建议

## 1. 基础类型完整映射表

_(开发中直接对照此表即可)_

| MySQL 数据库类型         | 含义与说明                           | Java 代码实体类型  |
| :----------------------- | :----------------------------------- | :----------------- |
| `TINYINT(1)` / `BOOLEAN` | 极小整数 / 布尔状态                  | `Boolean`          |
| `TINYINT` / `SMALLINT`   | 小整数                               | `Integer`          |
| `INT` / `INTEGER`        | 标准整数（主键常用）                 | `Integer`          |
| `BIGINT`                 | 大整数（分布式ID常用）               | `Long`             |
| `FLOAT` / `DOUBLE`       | 单精度 / 双精度浮点数                | `Float` / `Double` |
| `DECIMAL(M, D)`          | 精确数值（金额专用）                 | `BigDecimal`       |
| `CHAR(N)`                | 固定长度字符串                       | `String`           |
| `VARCHAR(N)`             | 可变长度字符串                       | `String`           |
| `TEXT` / `LONGTEXT`      | 长文本 / 文章详情                    | `String`           |
| `BLOB` / `LONGBLOB`      | 二进制数据（图片/文件）              | `byte[]`           |
| `DATE`                   | 日期 (如: 2023-10-01)                | `LocalDate`        |
| `TIME`                   | 时间 (如: 12:30:00)                  | `LocalTime`        |
| `DATETIME` / `TIMESTAMP` | 日期与时间 (如: 2023-10-01 12:30:00) | `LocalDateTime`    |

---

## 2. MySQL 数据库侧（建表时）建议

_在执行 `CREATE TABLE` 或设计 ER 图时，请遵循以下规范：_

- **主键选择**：单机应用普通表主键使用 `INT`；微服务/分布式系统或预期数据量超过 2000 万的表，强烈建议使用 `BIGINT` 以容纳雪花算法 ID。
- **金额与精度**：涉及资金、价格、数量等绝对不能有精度丢失的字段，**必须**使用 `DECIMAL(M, D)`，**严禁**使用 `FLOAT` 或 `DOUBLE`。
- **布尔与状态**：MySQL 没有真正意义上的 `BOOLEAN` 类型（本质仍是 `TINYINT(1)`），存储状态或开关值时统一使用 `TINYINT(1)`，约定 0 为 false，非 0 为 true。
- **文本长度控制**：内容长度基本固定的字段（如手机号、身份证号、短信验证码、MD5 哈希值）使用 `CHAR(N)`；长度变化较大的字段（如用户昵称、备注、标题）使用 `VARCHAR(N)`。

---

## 3. Java 代码侧（写实体类时）建议

_在编写 Entity / DTO / VO 等 Java 类时，请遵循以下规范：_

- **包装类优于基本类型**：数据库字段可能存在 `NULL` 值，实体类中**必须**使用包装类（如 `Integer`、`Long`、`Boolean`），严禁使用基本数据类型（如 `int`、`long`、`boolean`），否则会导致 NPE（空指针异常）或数据解析错误。
- **日期时间标准化**：强烈建议统一使用 Java 8+ 的现代时间 API，即 `LocalDate`、`LocalTime`、`LocalDateTime`，彻底告别老旧且难用的 `java.util.Date` 和 `java.sql.Timestamp`。
- **金额字段严格限制**：与数据库中的 `DECIMAL` 对应，Java 中**必须**使用 `BigDecimal`。在实体类中做金额运算时，必须使用 `BigDecimal` 提供的 `.add()`, `.subtract()`, `.multiply()` 等方法，严禁直接使用 `+`、`-`、`*`、`/` 符号。
