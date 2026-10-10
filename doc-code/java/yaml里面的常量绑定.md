# @ConfigurationProperties 原理与使用笔记

## 一、@ConfigurationProperties 是什么

`@ConfigurationProperties` 是 Spring Boot 提供的注解，作用是把 `application.yml`（或 `application.properties`）里的配置项，**自动绑定**到 Java 类的字段上。

与 `@Value` 的区别：

| 对比项   | `@Value`               | `@ConfigurationProperties`     |
| -------- | ---------------------- | ------------------------------ |
| 绑定方式 | 逐个字段写 SpEL 表达式 | 批量按前缀自动绑定             |
| 宽松绑定 | 不支持                 | 支持（驼峰/短横线/下划线互通） |
| 类型安全 | 弱类型（字符串解析）   | 强类型（自动转换）             |
| 校验支持 | 不支持                 | 支持 JSR-303 (`@Validated`)    |
| 适用场景 | 少量配置               | 一组相关配置                   |

---

## 二、使用示例

### 1. application.yml 配置

```yaml
app:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 123456
    pool-size: 10
  redis:
    host: localhost
    port: 6379
    timeout: 3000
```

### 2. Java 配置类

```java
@Component
@ConfigurationProperties(prefix = "app.datasource")
@Validated
public class DataSourceProperties {

    @NotBlank
    private String url;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Min(1)
    @Max(50)
    private Integer poolSize;

    // getter / setter ...
}
```

### 3. 注入使用

```java
@Service
public class OrderService {

    private final DataSourceProperties dsProps;

    public OrderService(DataSourceProperties dsProps) {
        this.dsProps = dsProps;
    }

    public void doSomething() {
        System.out.println(dsProps.getUrl());
    }
}
```

---

## 三、Spring Boot 绑定原理（核心流程）

### 整体链路

```
application.yml
    ↓
Environment (PropertySources)
    ↓
ConfigurationPropertiesBindingPostProcessor (BeanPostProcessor)
    ↓  读取 @ConfigurationProperties 的 prefix
    ↓  从 Environment 中筛选匹配的属性
    ↓  宽松绑定匹配字段名
    ↓  类型转换 (ConversionService)
    ↓  JSR-303 校验 (如果有 @Validated)
    ↓
Bean 字段赋值完成
```

### 步骤详解

#### Step 1：扫描与注册

被 `@ConfigurationProperties` 标注的类，必须被 Spring 容器管理，有两种方式：

- **方式一**：类上加 `@Component`，通过组件扫描自动注册
- **方式二**：在配置类上加 `@EnableConfigurationProperties(YourClass.class)`

> `@EnableConfigurationProperties` 内部会注册两个东西：
>
> 1. 你的配置类本身（作为 Bean）
> 2. `ConfigurationPropertiesBindingPostProcessor`（如果还没注册的话）

#### Step 2：后置处理器拦截

`ConfigurationPropertiesBindingPostProcessor` 实现了 `BeanPostProcessor` 和 `PriorityOrdered` 接口，优先级很高。

在 Bean 初始化阶段，`postProcessBeforeInitialization()` 方法会被调用：

```
postProcessBeforeInitialization(Object bean, String beanName) {
    // 1. 检查这个 Bean 是否有 @ConfigurationProperties 注解
    ConfigurationProperties annotation = ...;
    if (annotation != null) {
        // 2. 获取 prefix
        String prefix = annotation.prefix();
        // 3. 调用绑定器进行绑定
        bindConfigurationProperties(bean, annotation, prefix);
    }
}
```

#### Step 3：宽松绑定（Relaxed Binding）

Spring Boot 会对属性名做规范化处理，支持多种写法自动匹配：

```
配置写法                          绑定的字段
─────────────────────────────────────────────────
app.user-name        →          userName
app.userName         →          userName
app.user_name        →          userName
App.USER_NAME        →          userName  (大小写不敏感)
```

原理：Spring Boot 把属性名中的 `-`、`_` 都统一去掉，然后按驼峰规则匹配字段名。

#### Step 4：类型转换

YAML/Properties 中的值本质都是字符串，Spring 的 `ConversionService` 会自动做类型转换：

- `String` → `Integer` / `Long` / `Double` / `Boolean`
- `String` → `LocalDate` / `LocalDateTime`（需要格式化）
- `String` → `List` / `Set` / `Map`（YAML 集合语法）
- `String` → 自定义对象（递归绑定）

如果类型转换失败，Spring Boot 会直接启动报错，而不是静默失败。

#### Step 5：JSR-303 校验

如果类上标注了 `@Validated`（或 `@Validation`），绑定完成后会自动触发校验：

```java
@Component
@ConfigurationProperties(prefix = "app.datasource")
@Validated  // 开启校验
public class DataSourceProperties {

    @NotBlank           // 不能为 null 或空字符串
    private String url;

    @Min(1) @Max(50)    // 范围校验
    private Integer poolSize;

    @Pattern(regexp = "^[a-z]+")  // 正则校验
    private String env;
}
```

校验失败会抛出 `MethodArgumentNotValidException`，导致应用启动失败。

---

## 四、@EnableConfigurationProperties 源码简析

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(ConfigurationPropertiesRegistrationRegistrar.class)
public @interface EnableConfigurationProperties {
    Class<?>[] value() default {};
}
```

关键点：

1. `@Import(ConfigurationPropertiesRegistrationRegistrar.class)` 导入了一个 `ImportBeanDefinitionRegistrar`
2. `ConfigurationPropertiesRegistrationRegistrar` 会扫描 `@EnableConfigurationProperties` 指定的类
3. 对这些类注册 `ConfigurationPropertiesBindingPostProcessor` 的绑定逻辑
4. 同时把这些类本身注册为 Bean

> 注意：如果配置类上已经加了 `@Component`，可以不用 `@EnableConfigurationProperties`，因为组件扫描会自动注册 Bean，但 `ConfigurationPropertiesBindingPostProcessor` 仍然需要被注册（Spring Boot 自动配置类 `ConfigurationPropertiesAutoConfiguration` 已经做了这一步）。

---

## 五、绑定顺序与优先级

当同一个属性在多个地方配置时，优先级从高到低：

1. **命令行参数**：`--app.datasource.url=jdbc:mysql://prod`
2. **JVM 系统属性**：`-Dapp.datasource.url=jdbc:mysql://prod`
3. **操作系统环境变量**：`APP_DATASOURCE_URL=jdbc:mysql://prod`
4. **application-{profile}.yml**（激活的 profile）
5. **application.yml**（默认配置）

> 环境变量规则：`app.datasource.url` → `APP_DATASOURCE_URL`（转大写，`.` 和 `-` 都变成 `_`）

---

## 六、常见坑与注意事项

### 1. 字段必须有 setter 方法

`@ConfigurationProperties` 默认通过 setter 方法赋值（也可以用构造器注入，但需要 `@ConstructorBinding`）。如果只有 getter 没有 setter，绑定会失败。

### 2. 嵌套对象需要 getter 返回非 null 实例

```java
// 正确写法：初始化嵌套对象
private RedisProperties redis = new RedisProperties();

// 错误写法：嵌套对象为 null，绑定时会 NPE
private RedisProperties redis;
```

### 3. 与 @Value 混用时的注意事项

同一个类上可以同时用 `@ConfigurationProperties` 和 `@Value`，但建议一个类只选一种方式，避免混淆。

### 4. 集合类型的绑定

```yaml
app:
  allowed-origins:
    - http://localhost:3000
    - http://localhost:8080
  headers:
    X-Custom-Header: value1
    X-Another-Header: value2
```

```java
private List<String> allowedOrigins;        // 绑定列表
private Map<String, String> headers;        // 绑定 Map
```

### 5. 前缀不能为空

`@ConfigurationProperties(prefix = "")` 或 `prefix = " "` 会绑定所有属性，容易冲突，不建议这样做。

---

## 七、面试高频追问

### Q1: @ConfigurationProperties 和 @Value 有什么区别？

见上方对比表格。核心点：批量 vs 逐个、宽松绑定、类型安全、校验支持。

### Q2: @ConfigurationProperties 的绑定时机是什么时候？

Bean 初始化阶段，具体是在 `BeanPostProcessor.postProcessBeforeInitialization()` 回调中完成的，早于 `@PostConstruct` 和 `InitializingBean.afterPropertiesSet()`。

### Q3: 宽松绑定的原理是什么？

Spring Boot 对属性名做规范化：去掉 `-`、替换 `_` 为 `-`、转小写，然后按驼峰规则匹配字段名。

### Q4: 如果配置项缺失会怎样？

不会报错，字段保持默认值（基本类型有 Java 默认值，引用类型为 null）。如果需要必填校验，配合 `@NotBlank` / `@NotNull` + `@Validated` 使用。

### Q5: ConfigurationPropertiesBindingPostProcessor 和 PropertyPlaceholderConfigurer 的关系？

`PropertyPlaceholderConfigurer`（`@Value` 的底层）优先级更低，在 `ConfigurationPropertiesBindingPostProcessor` 之后执行。所以 `@ConfigurationProperties` 绑定时，`@Value` 还没解析，不能互相引用。

### Q6: 怎么实现自定义类型转换？

实现 `Converter<S, T>` 接口或 `GenericConverter`，注册为 Bean 即可。Spring Boot 的 `ConversionService` 会自动发现并使用。

---

## 八、总结

`@ConfigurationProperties` 的核心链路就一句话：

> **Spring Boot 在 Bean 初始化时，通过 `ConfigurationPropertiesBindingPostProcessor` 拦截，从 `Environment` 中按前缀筛选属性，经过宽松绑定匹配字段名、类型转换、校验，最终把值赋给 Bean 的字段。**

掌握这个流程，面试基本不会丢分。
