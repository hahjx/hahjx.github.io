## springboot组成
  - spring
  - springMvc

## springboot思想
就是一个大的 Map ，在启动的时候spring框架会扫描所有的类，供调用。
至于要怎么去扫描，就是通过注解的形式（例如@component，其他的@controller，@services都实现了这个注解）。
每个类在初始化之后都是一个单例，如果要使用非单例的话，需要用@Scope

## spring MVC的分层
- 分层
  - entity层（数据库表的映射，一个表一个类）
  - dao层（写sql）
  - services层（写增删改查业务逻辑）
  - controller 给前端调用
- Q&A:
  我看到一个说法是 Entity 是表的映射，一个class对应一个表；Dao层是写sql的， 那Entity 和DAO 功能是不是有点重复了？
  完全不重复，它们在系统中扮演的是截然不同的两个角色：
  - Entity（实体类）是“数据容器”：它是一个纯粹的 数据结构（Data Standard），只负责存数据，没有任何行为（没有业务逻辑或数据库操作代码）。
  - DAO（数据访问层）是“操作者”：它是一个 动作执行者（Behavior Execution），专门负责对数据执行增删改查（SQL/CRUD 操作）。
  - 如果用现实生活中的事物来打比方：
    Entity 是“货架上的包裹”，只负责装载东西；
    DAO 是“快递员”，负责把包裹送到仓库（写入数据库）或者从仓库搬出来（查询数据库）。
  - 调用关系
    control调用service，service调用dao，dao层操作数据库；那么control怎么调用services层呢？原理就是在springboot初始化的时候会去扫描每个被注解的类进入一个map结构，（key：value）的结构里面，要使用的时候直接拿就可以了。这个就是DI和AOP的概念（DI= dependency Injection，AOP= Aspect-Oriented programing切面编程 类似前端的axios）