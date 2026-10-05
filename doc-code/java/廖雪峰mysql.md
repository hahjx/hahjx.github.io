## 
- DDL：Data Definition Language DDL允许用户定义数据，也就是创建表，删除表，修改表
- DML：Data Manipulation Language DML 为用户提供添加、删除、更新数据的能力
- DQL：Data Query Language DQL允许用户查询数据
> 这几个有什么区别
>
| 分类 | 全称 | 操作层级/对象 | 核心命令 | 是否可回滚 |
| :--- | :--- | :--- | :--- | :--- |
| DDL | 数据定义语言 | 数据库/表的结构（骨架） | CREATE, ALTER, DROP | ❌ 不可回滚 |
| DML | 数据操作语言 | 表中的具体数据（内容） | INSERT, UPDATE, DELETE | ✅ 可回滚 |
| DQL | 数据查询语言 | 数据的检索与读取 | SELECT | 不涉及修改 |

## 语法特点
SQL语言关键字不区分大小写；
表名和列名有的区分大小写，有的不区分
本教程约定：SQL关键字总是大写，以示突出，表名和列名均使用小写。

## SQL全称
SQL的全称是Structured Query Language，中文翻译为结构化查询语言。

## 使用docker安装mysql
> $ docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -v /Users/liaoxuefeng/mysql-data:/var/lib/mysql mysql

参数解析：-v /Users/liaoxuefeng/mysql-data:/var/lib/mysql：表示将本地目录映射到容器目录/var/lib/mysql作为MySQL数据库存放的位置，需要将/Users/liaoxuefeng/mysql-data改为你的电脑上的实际目录；

## 主键
- 主键选择规则
  1. 不使用任何业务相关的字段作为主键。
  2. 能唯一确定一条记录
  3. 主键也不应该允许NULL
  4. 使用BIGINT自增或者GUID类型

- 联合主键
  关系数据库实际上还允许通过多个字段唯一标识记录

## 外键约束
- 实现：通过定义外键约束
    ```sql
        ALTER TABLE students
        ADD CONSTRAINT fk_class_id
        FOREIGN KEY (class_id)
        REFERENCES classes (id);
    ```
    其中，外键约束的名称fk_class_id可以任意，FOREIGN KEY (class_id)指定了class_id作为外键，REFERENCES classes (id)指定了这个外键将关联到classes表的id列（即classes表的主键）。
    由于外键约束会降低数据库的性能，大部分互联网应用程序为了追求速度，并不设置外键约束，而是仅靠应用程序自身来保证逻辑的正确性。这种情况下，class_id仅仅是一个普通的列，只是它起到了外键的作用而已。**就是说实际上都用普通的列代替外键逻辑**


## 多对多关系
student和tearcher都连接一个class表。
我们可以通过student=>class=>teacher找到一个student对应的老师
通过中间表，实现了多对多的关系

## 索引
定义：对某一列或者多个列的值进行预排序的数据结构
```sql
ALTER TABLE student
ADD INDEX idx_score(列名)
```
列名可以多个
- 优点：提升 查询  速度
- 缺点：增删改速度变慢
- 使用主键的索引效率是最高的，因为索引唯一

## 唯一索引
定义：唯一索引是指索引列的值必须唯一，不能重复
```sql
ALTER TABLE student
ADD UNIQUE INDEX uni_name(列名)
```

## 条件查询
- WHERE关键字
- 条件表达式关键字
  - 与 AND
  - 或 OR
  - 非 NOT
    ```sql
    SELECT * FROM students WHERE NOT class_id = 2;
    ```
  - 关系优先级
    1. NOT
    2. AND
    3. OR
    4. 括号可以改变优先级
   
## 投影查询
相较于select *，使用select 字段1，字段2，字段3这样的方式选择部分查询
字段123称为投影

## 排序
使用 ORDER BY：
```
SELECT * from xxx ORDER BY 字段名 DESC
```

## 分页
使用 LIMIT xx OFFSET xx；
xx是数字
- 推导过程
LIMIT总是设定为pageSize；
OFFSET计算公式为pageSize * (pageIndex - 1)。


## 聚合查询
聚合查询函数
```
SELECT COUNT(*) FROM students;
```
SQL的聚合函数
| 函数 | 说明 |
| :--- | :--- |
| **COUNT** | 计算符合条件的记录行数或某列非 NULL 值的数量 |
| **SUM** | 计算某一列的合计值，该列必须为数值类型 |
| **AVG** | 计算某一列的平均值，该列必须为数值类型 |
| **MAX** | 计算某一列的最大值 |
| **MIN** | 计算某一列的最小值 |

Q：count(*)怎么数法
A：数据库会自动选择占用空间最小的那一列（或者叫二级索引）去数。
Q：不是，那比如count(*)有一行 有name是小红，age是null，这个算count吗？
A：算的，COUNT(*) 关注的是“这一行存不存在”。只要“小红”这一行记录在数据库里，哪怕她的 age 是 NULL，甚至其他字段全都是 NULL，COUNT(*) 也会把它当成完整的一行，计数 $+1$。

## 分类
使用GROUP BY关键字，多个分类维度用逗号隔开比如 GROUP BY class_id,gender  

## 多表查询
比如select * from 表A,表B，会生成一个笛卡尔积，

```sql
SELECT
    s.id sid,
    s.name,
    s.gender,
    s.score,
    c.id cid,
    c.name cname
FROM students s, classes c;
```
注意到FROM子句给表设置别名的语法是FROM <表名1> <别名1>, <表名2> <别名2>。这样我们用别名s和c分别表示students表和classes表。


## 修改数据 （增删改）

- 增加：使用Insert
- 删除：使用Delete
- 修改：使用update

注意：如果不加条件语句，删除和修改都会修改全表
例如：
```sql
DELETE FROM students;
UPDATE students SET score = 100;
```

## 操作数据库
1. 查看 SHOW DATABASES
2. 删除 DROP DATABASE xxxx
3. 创建 CREATE DATABASE xxxx
4. 使用 USE DATABASE xxx

## 操作表
1. 查看所有表 SHOW TABLES 表名
2. 查看具体表 DESC 表名
3. 查看创建表的sql语句 SHOW CREATE TABLE 表名
4. 删除表 DROP 表名
5. 创建表 CREATE TABLE 表名
6. 修改表 ALTER TABLE 表名
7. 修改表结构 ALTER TABLE 操作名 COLUMN 列名

## 使用 EXIT 直接退出sql

## 实用SQL语句
- 插入或者替换 如果原来的存在，就先删除然后再插入
  ```sql
  REPLACE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
  ```
- 插入或者更新 如果原来的存在，就更新
  ```sql
  INSERT INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99) ON DUPLICATE KEY UPDATE name='小明', gender='F', score=99;
  ```
  更新的字段由UPDATE指定。
- 插入或者忽略 如果原来的存在，就忽略当前语句
  ```sql
  INSERT IGNORE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
  ```
- 快照 复制当前表数据到一个新的表，如果表不存在就创建
  ```sql
  -- 对class_id=1的记录进行快照，并存储为新表students_of_class1:
  CREATE TABLE students_of_class1 SELECT * FROM students WHERE class_id=1;
  ```
- 写入查询 
  ```sql
  INSERT INTO statistics (class_id, average) SELECT class_id, AVG(score) FROM students GROUP BY class_id;
  ```
  相当于结合起来 
  INSERT INTO 目标表名 (字段A, 字段B)
  SELECT 字段A，字段B FROM 表明 条件语句

