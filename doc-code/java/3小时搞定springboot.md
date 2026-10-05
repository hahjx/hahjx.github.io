## 3小时搞定springboot

- 项目依赖
  - java/jdk版本
  - springboot版本（3和2有差别）
  - maven版本

- java/jdk，maven，springboot版本有什么差别吗，我在创建项目的时候应该怎么注意这几个的搭配关系
  - 它们在 Java 生态中扮演着不同的角色。简单来说：Java/JDK 是基石，Spring Boot 是上层框架，Maven 是管家。把建房子做个比喻：Java / JDK：砖头与水泥（基础语言和运行环境）。Spring Boot：预制件与现成脚手架（帮快速搭好房子骨架的工具库）。 Maven：物流与建材调度系统（帮下载、管理和编译各种第三方零部件，如数据库驱动、日志包）。
- 那idea创建springboot项目的时候java和jdk还可以选，这两个要怎么搭配？
  - JDK（开发工具包）：指你电脑本地安装的真实 JDK 运行环境。
  - Java（目标语言版本 / Target Bytecode Version）：指你的代码最终要被编译成哪个 Java 版本的字节码（对应 pom.xml 里的 <java.version>）
  - 选择与搭配的原则
    核心原则只有一条：JDK 版本必须大于或等于 Java（目标版本）。
- idea创建项目的时候，有组和工件两个，这两个是什么？
  - Group组 + Artifact工件 +version组成了java项目在全局的唯一标识
  - Group组一般代表这个项目属于哪个公司、组织或者团队，通常采用 域名反写 的格式（com.baidu）
  - artifact代表这个具体项目的名称（最终编译打包出来的 jar/war 包的名字）
  - idea创建springboot项目之后，相当于一个maven项目，有一个启动类（main中的代码）和springboot的依赖项

- @SpringBootApplication
  Spring Boot 项目的核心入口注解，主要作用是开启自动配置、组件扫描和 Spring 配置类定义。
  允许多个，但通常一个应用里面建议只有一个
- 添加springboot依赖

  ```java
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
  </dependency>

  ```

  Q:为什么我用idea创建完springboot项目之后，还要添加这两个依赖，然后为什么不用写version标签
  A:因为一创建的时候没有勾选Spring Web，spring-boot-starter-web 是核心启动依赖和单元测试依赖；引入 spring-boot-starter-web：你的项目才具备处理 HTTP 请求、构建 RESTful API 以及内置 Tomcat Web 服务器的能力。不引入它：你的项目仅仅是一个普通的 Java 控制台程序，启动后执行完主函数就会直接退出，不会监听任何网络端口
  Q:为什么不需要写 <version> 版本号标签？
  A:不用写版本号，是因为父工程（Parent POM）帮你做好了版本仲裁。
    <!-- todo -->

## 写第一个接口

- 添加control层
- 使用 @RestController和 @mapping注解

## 三种传参方式

1. @requestParams 问号传参 controller层里面不加注解就是这个
2. @PathVariable 路径传参
3. @RequestBody Json方式传参，在前后端分离的项目中常用，结合entity层，在entity里面写类描述数据结构

```java
package com.hjx.demo.entity;

public class User {
    public String name;
    public int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

## restful风格

- 自己理解：相当于用post、delete、put、get实现增删改查之类的操作
- 标准理解：URL 里写名词，动作留给 HTTP 方法，例如GET /users/1（获取 ID 为 1 的用户）；POST /users（新增用户）

## @RequestMapping

添加在@RestController类前面，统一添加类里面方法的url前缀，设置之后类方法里面的url可以为空，也就是@GetMapping直接后面不用写括号

## 批量添加前缀

- 在application.yaml中的server.servlet.context-path:/api

## 设置端口号

在application.yaml中的server.port里面设置

## 使用多个环境配置

同时在resources文件夹下创建三个配置文件：

- application.yaml
  - 这个里面的spring.profiles.active里面使用，指定value为dev或者prod
- application-dev.yaml
  - 开发环境的自定义配置
- application-prod.yaml
  - 生产环境的自定义配置

## 连接mysql

要安装驱动和mybatis
需要两个GAV 加上mysql-connector-j是直接就可以用了，但是很繁琐，需要加上mybatis-plus-boot-starter

1. 安装
   要使用驱动（实际上就是一个jar包，我们在pom.xml里面添加就GAV可以了
   1. 确定mysql的版本和驱动版本，对应mysql的驱动叫做mysql-connector-j
   2. [mysql版本一般指定8的版本](安装mysql.md)
   3. mysql-connector-j 不用手动指定 <version> 标签，直接让 Spring Boot Parent 帮忙确定版本
   4. 在pom.xml里面添加依赖
   ```java
   <dependency>
       <groupId>mysql</groupId>
       <artifactId>mysql-connector-j</artifactId>
       <scope>runtime</scope>
   </dependency>
   ```

   1. 创建数据库
      要选择 utf8mb4 格式的
   1. 配置连接
      在application.yaml里面添加
      1. spring.datasource.url
         固定某个值
      2. spring.datasource.username，
      3. spring.datasource.password
      4. spring.datasource.driver-class-name

## 添加mybatis-plus

- mybatis-plus是什么
  `帮你管理数据库连接池、自动将数据库表映射为 Java 对象（POJO），并且让你一行 SQL 都不用写就能直接调用 insert()、selectById() 等方法。`
  使用mybatis-plus
  1. 创建mapper文件夹（这个就是传统的dao层（Data Access Object），里面写<mark>接口</mark>映射对象,这里面的User类是entity层的
     ```java
     public interface UserMapper extends BaseMapper<User> {}
     ```
  2. 在config文件夹里面配置
     ```java
     @MapperScan("填写mapper文件夹的位置")
     @Configuration
     public class MyBatisPlusConfig {
     }
     ```
  3. 添加测试方法，在测试类里面测试并且注释

     ```java
     @SpringBootTest
     class DemoApplicationTests {
         @Resource
         private UserMapper userMapper;

         @Test
         void contextLoads() {
             System.out.println(("----- selectAll method test ------"));
             List<User> userList = userMapper.selectList(null);
             Assert.isTrue(5 == userList.size(), "");
             userList.forEach(System.out::println);
         }

     }
     ```

     - 后面其他层都是使用这个mapper层的对象来操作数据

- 使用mybatis-plus的分页插件
  - 在control层的方法里面，用mapper对象.selectPage(new Page(n,n),new lambadaUpdateWrapper<>())
  - 这个page插件之后要引入

## mysql配合navicat里面，有哪些层级

连接层(connection 例如3306端口)=>数据库层(database)=>数据表层(table)=>表内对象与字段层(table Fields&Object)

## 添加了mybatis依赖之后，配置bom是什么东西？

要写在<dependencyManagement>标签里面
当有多个子工程的时候，配置了bom，子工程就会沿用父工程的配置
在mybatis-plus的最新版本，分页插件就拆出来了，可以在bom里面找到对应的分页插件

## sql课程

https://www.bilibili.com/video/BV1UE41147KC/?buvid=YB4617B691281BB0417C84E8DE60E7A45DCE&from_spmid=search.search-result.0.0&is_story_h5=false&mid=%2Bl1qngxwLEdpkfE4J3N9N38FTQ%2FSZMtL1rElX6M3iMo%3D&p=2&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_session_id=108FB10A-666F-4151-9476-90C9964F989E&share_source=COPY&share_tag=s_i&timestamp=1784529675&unique_k=YuDIYwU&up_id=685986&vd_source=4477d4e15589a5a03515ae9953870592

## 三层架构

1. @control路由请求
2. @serveice处理业务
3. @mapper操作数据

## java声明变量的标准语法结构

`[修饰符] [泛型参数] 数据类型 变量名 [= 初始值];`

- 修饰符
  - 访问权限修饰符（控制谁能用） 例如private
  - 状态与行为修饰符（控制怎么用） 例如static
  - 泛型参数（控制什么类型） 例如<T>
  - 框架修饰符 第三方框架使用例如：@Resource
  - 数据类型 例如int、String、User

- 数据类型
  - 接口
  - 类

## 结合mybatis-plus，怎么添加service层

1. 编写接口A继承 IService<T>,其中范型填入entity层的数据描述类
2. 编写类实现上面的接口A，并且继承ServiceImpl<mapper,user>
   - 其中mapper是mapper层文件夹里面的
   - ServiceImpl<mapper,user>的user是Uentity层里面的数据描述类，继承了BaseMapper的baseMapper<entity的自定义实体类比如User>，相当于mapper里面用到了user类，service也用到了user类

## 继承和实现

- 继承
  - 含义：is-A
  - 范围：类与类、接口和接口之间
  - 数量：单个，只能单继承
- 实现
  - 含义：has-A
  - 范围：类与接口之间
  - 数量：多个，一个类可以实现多个接口
- 两个书写顺序
  继承在前面，实现在后面

## 添加swagger

1. 添加GAV

```
  <dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>3.0.3</version>
  </dependency>
```

2. 添加application.yaml配置
3. 添加配置类 @configration

## 切面编程 AOP

1. 添加GAV
   `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aspectj</artifactId>
        </dependency>`
2. 编写类

```java
  @Component
  @Aspect
  public class LogAspect {
      @Before("execution(* com.hjx.demo.controller.*.*(..))")
      public void before(){
          System.out.println("开始打印日志");
      }
  }
```

## 整合redis

## springboot的docker部署

1. 先把jar包打出来，命令是
   ```bash
    mvn package
   ```
2. 编写dockerfile文件

   ```dockerfile
    # 1. 使用基础 JDK 镜像（如果你用的 JDK 17）
    FROM eclipse-temurin:17-jre-alpine

    # 2. 设置容器内部的工作目录,这个设置了是为了一个规范，实际上每个容器都有独立的进程和存储
    WORKDIR /app

    # 3. 将 target 目录下打好的 jar 包复制到镜像中
    # 注意：把 demo-0.0.1-SNAPSHOT.jar 换成你 target 目录下生成的实际 jar 包名字
    COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

    # 4. 暴露项目端口（根据 application.yml 里的 server.port 决定，默认 8080）
    EXPOSE 8888

    # 5. 启动容器时运行 jar 包
    ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

3. 运行命令
   ```bash
   docker build -t my-demo:1.0 .
   ```
   ps:普通模式下这个打包结果image无法直接在windows上看到，有一个ext4.vhdx，这个文件会在本地开发电脑上膨胀体积；如果你需要把他分享出去，要通过其他形式打包为tar文件
4. 运行启动命令，会创建一个container运行上面的image

```bash
  docker run -d `
  --name my-demo-container `
  -p 8888:8888 `
  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/你的数据库名?characterEncoding=UTF-8&serverTimezone=UTC" `
  -e SPRING_DATASOURCE_USERNAME="root" `
  -e SPRING_DATASOURCE_PASSWORD="你的数据库密码" `
  -e SPRING_DATA_REDIS_HOST="host.docker.internal" `
  my-demo:1.0
```

这样的结果就是可以用本地的sql服务和docker里面的redis，同时springboot的服务是跑在docker容器里面的。这个docker的container里面只跑了java的服务，并且一般情况下一个容器只建议跑一个东西（类似这个springboot）
然后就是再次启动容器的时候不用重新搞上面这个bash命令了，因为docker有持久化

### 全局错误异常拦截

1. 自定义业务异常，使用自定义类定义例如BusinessException
2. 在全局用handler处理
   - 这个handler的顺序怎么决定？父类和子类怎么说？要子类放前面吗？
     `springboot有最精准匹配的原则，会选择子类匹配`
