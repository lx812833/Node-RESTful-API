### Node仿知乎RESTful API开发设计

#### RESTful 架构

`REST`全称是 `Representational State Transfer`，中文意思是 `表述性状态转移`。 它首次出现在2000年Roy Fielding的博士论文中，Roy Fielding是HTTP规范的主要编写者之一。 他在论文中提到："我这篇文章的写作目的，就是想在符合架构原理的前提下，理解和评估以网络为基础的应用软件的架构设计，得到一个功能强、性能好、适宜通信的架构。**`REST指的是一组架构约束条件和原则。" 如果一个架构符合REST的约束条件和原则，我们就称它为RESTful架构。`**

- **Representational：数据的表现形式（JSON、XML.....）**
- **State: 当前状态或者数据**
- **Transfer: 数据传输**

##### RESTful 六大限制

1. **客户-服务器（Client-Server）**
    - 关注点分离
    - 服务端专注数据存储，提高了简单性
    - 前端专注用户界面，提升了可移植性

2. **无状态（StateLess）**
    - 所有会话信息都保存在客户端
    - 每次请求必须包括所有信息，不能依赖上下文信息
    - 服务端不用保存会话信息，提升简单性、可靠性、可见性（软件工程中接口之间透明程度）

3. **缓存（Cache）**
    - 所有服务端响应都要被表示为可缓存（缓存在客户端（浏览器））或不可缓存
    - 减少前后端交互，提升性能

4. **统一接口（Uniform Interface）**
    - 接口设计尽可能统一通用，提升了简单性、可见性
    - 遵循接口规范，接口与实现解耦，使前后端可以独立开发迭代

5. **分层系统（Layered System）**
    - 每层只知道相邻的一层，后面隐藏的就不知道了
    - 客户端不知道是和代理还是真实服务器通信
    - 其它层：安全层、负载均衡、缓存层等

6. **按需代码（Code-On-Demand）（可选）**
    - 客户端可以下载运行服务端传来的数据（比如JS）
    - 通过减少一些功能，简化了客户端


##### 统一接口的限制

1. **资源的标识**
    - 基于“资源”，数据也好、服务也好，是任意可以命名的事物，在RESTFul设计里一切都是资源。
    - 每个资源可以通过`URI`（统一资源标识符）被唯一的标识
        
        例如 `https://api.z.cn/v1/product/recent?page=3&size=20`
    
2. **通过表述来操作资源**
    - 通过表述`Representation` 操作资源，比如`JSON`、`XML`等
    - 客户端不能直接操作（比如`SQL`）服务端资源
    - 客户端应该通过表述（比如`JSON`）来操作资源

3. **自描述消息**
    - 每个消息（请求或响应）必须提供足够的信息让接受者理解
    - 消息：如媒体类型（`application/json、application/xml`）
    - 消息：如HTTP方法： `GET、POST、DELETE`
    - 是否缓存： `Cache-Control`

4. **超媒体作为应用状态引擎**
    - 超媒体： 带文字的链接
    - 应用转态：一个网页
    - 引擎：驱动、跳转
    - 合起来就是：点击链接跳转到另一个网页


##### RESTful API

符合REST架构风格的**API**就是 **RESTful API**

应该包含三方面：

1. 基本的URL 如 `https://api.z.cn/v1/product/recent?page=3&size=20`
2. 标准的HTTP方法，如`GET、POST、PUT、DELETE等`
3. 传输的数据媒体类型，如`JSON、XML`


#### Koa2

##### 项目初始化

1. 安装下载 Koa： `npm i koa --save`
2. 设置自动重启 **`nodemon`** ：`npm i nodemon --save-dev`（`-dev` 是指只在开发阶段适用）
    
    在`package.json`里设置启动方式，再 `npm start` 启动
    
    ```python
    "scripts": {
        "start": "nodemon index.js"
    },
    ```
 
 
##### Koa中间件与洋葱模型
 
> **当一个中间件调用 `next()` 则该函数暂停并将控制传递给定义的下一个中间件。当在下游没有更多的中间件执行后，堆栈将展开并且每个中间件恢复执行其上游行为。**

    ```python
     app.use(async (ctx, next) => {
        console.log(1)  // 当执行打印 1 后，调用 next() ,执行下一个中间件，打印 3
        await next()
        console.log(2)
        console.log(ctx.lastVal) // 通过挂载在ctx，可以取到最后中间件的结果
     })

     app.use(async (ctx, next) => {
        console.log(3)
        await next()
        console.log(4)
     })

    app.use(async (ctx, next) => {
        console.log(5)
        ctx.lastVal = "ctx挂载"
    })
    ```

打印顺序为： 1 3 5 4 2 ctx挂载

**`koa-compose：koa-compose则是将 koa/koa-router 各个中间件合并执行，结合 next() 形成一种串行机制，并且是支持异步，这样就形成了洋葱式模型`**


#####  koa-bodyparser中间件

**koa-bodyparser中间件** 是 koa2用来`post`提交数据的中间件

1. 下载 `npm install koa-bodyparser@2 --save`
    引入并挂载配置中间件
    
    ```python
    const bodyParser = require('koa-bodyparser')
    
    app.use(bodyParser())
    ```
 2. 读取`post`数据 对象格式 `ctx.request.body`
    
    ```python
    router.post('/doAdd',async (ctx) =>{
        console.log(ctx.request.body)
    })  
    ```
 
##### koa-router 路由

1. 下载`npm i koa-router --save`

    引入并挂载

    ```python
    const Router = require("koa-router")
    const router = new Router()
    
    router.get("/users", (ctx) => {
        ctx.body = "用户列表页面"
    })
    router.get("/users/:id", ctx => {
        ctx.body = `当前${ctx.params.id}用户`
    })

    app.use(router.routes())
    ```
 
2. 路由前缀
 
    使用路由前缀 `prefix` 的好处是，当路由前缀需要更改时，直接更改前缀即     可，简洁便利。
    如：
    
    ```python
    const userRouter = new Router({ prefix: "/users" })


    userRouter.get("/", (ctx) => {
        ctx.body = "用户列表页面"
    })
    userRouter.get("/:id", ctx => {
        ctx.body = `当前${ctx.params.id}用户`
    })

    app.use(userRouter.routes())
    ```

#### App

一个规范有序的目录更富有表现性与逻辑性，让人耳目一新，简单上手。所有文件是以 `app`为根路径。

    ```
    ├── routes  // 路由
    ├──── home.js  // home
    ├──── users.js  //  用户路由
    ├── controllers // 控制器
    ├──── home.js  // home
    ├──── users.js  //  users控制器
    ```

##### routes路由


    
5.5