# 使用原生方法和mybatis

## springBoot操作mysql数据库原生方法
1. 在application.yaml中配置数据库连接信息
  ```yaml
  spring:
    datasource:
      url: jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
      username: root
      password: mysql123456
      driver-class-name: com.mysql.cj.jdbc.Driver
  ```
2. `import org.springframework.jdbc.core.JdbcTemplate;`
   在类里面注入JdbcTemplate
   ```java
   @Autowired
   private JdbcTemplate jdbcTemplate;
   ```
3.  调用方法
```java
    jdbcTemplate.update(sql,user.getUsername(),user.getPassword());
```

## 使用mybatis
### 使用注解
1. 定义mapper
   ```java
    public interface UserMapper {
        @Select("SELECT * from users WHERE id = #{id}")
        UserEntity findById(@Param("id") long id);

        @Insert("INSERT INTO users(user_name,password) VALUES(#{userName},#{password})")
        @Options(useGeneratedKeys = true,keyProperty = "id")
        int insertUser(UserEntity user);

        @Update("UPDATE users SET password = #{password} WHERE id = #{id}")
        int updatePassword(@Param("id") Long id,@Param("password") String password);

        @Delete("DELETE FROM users WHERE id = #{id}")
        int deleteById(long id);
    }
    ```
2. 加上scan注解，到mapper类的文件夹里面
3. 在controller或者service层里面使用就好

### 使用xml映射

### 从实体类开始到mybatis注解，我每个字段大小写要怎么对应
三者的对应关系原则
- 数据库列名：推荐采用 下划线分隔（如 user_name）。
- Java 实体类属性：采用 小驼峰命名（如 userName）。
- MyBatis SQL 占位符 (#{...})：必须与 Java 实体类属性名完全一致（区分大小写）。
  ```java
    @Insert("INSERT INTO users(user_name,password) VALUES(#{userName},#{password})")
  ```
  比如前面这个，user_name是列名，和数据库对应；#{userName}是对应java实体类的
### 如果mybatis-plus我不想用@Table注解注释实体类，我该怎么做？
- 数据库用下划线小写，java的实体类用大驼峰，MP 就能做到完全自动映射，不需要加任何注解。
  表名映射：Java 类名 UserVip（大驼峰） $\rightarrow$ 自动映射为数据库表名 user_vip（下划线小写）。
  另外:列名映射：Java 属性名 userName（小驼峰） $\rightarrow$ 自动映射为数据库列名 user_name（下划线小写）。

