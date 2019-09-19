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
##### 错误处理

**错误处理** 是指 `编程语言或计算机硬件里的一种机制，处理软件或信息系统中出现的异常状况。`
而`异常状况`又分为：

1. 运行错误，返回500
2. 逻辑错误，如找不到（404）、先决条件失败（412）、无法处理的实体（参数格式不对，422）等

为保证程序健壮性。防止程序挂掉；告诉用户错误信息；便于开发者调试，需要错误处理。


**错误处理中间件：koa-json-error**

1. 安装 `npm i koa-json-error --save`

2. 设置区分生产环境与开发环境： 安装 `npm i cross-env --save-dev`
    
    在 **package.json** 中设置
    
    ```python
    "scripts": {
        "start": "cross-env NODE_ENV=production node app",
        "dev": "nodemon app"
    },
    ```
3. 修改配置使其在生产环境下禁用错误堆栈 **stack** 的返回
    
    ```python 
    const jsonError = require('koa-json-error')
    
    app.use(jsonError({
        postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
    }))
    ```
    为使所有请求接口使用错误处理，`app.use(jsonError())`需放置在前面。

##### 使用 koa-parameter 校验参数

1. 安装 **npm i koa-parameter --save**
2. 导入并使用
    
    ```python
    const parameter = require('koa-parameter')
    
    // 由于需要在发出请求后进行校验参数，所以校验中间件放在请求之后
    
    app.use(bodyParser())
    app.use(parameter(app))
    ```
    
3. 在具体路由中写校验规则，如 users 创建用户接口
    
    ```python
    ctx.verifyParams({
        name: { type: 'string', required: true },
        age: { type: 'number', required: false }
    });
    ```
#### MongoDB

##### Mongoose

**Mongoose**是一个开源的封装好的实现 `Node` 和 `MongoDB` 数据通讯的数据建模库。


1. 安转 `npm i mongoose --seve` 安装 `glob`导入所有的 `schema`: `npm i glob --save`
2. 连接 **Mongoose**
    
    在根目录下创建 `database` 文件夹，用来存放和数据库操作有关的文件。在 `database` 文件夹下，建立一个`init.js` 文件，用来作数据库的连接和一些初始化的事情。
    
    使用 `promise` ，确保成功连接数据库，需要对意外处理和逻辑处理。让程序增加健壮性。
    
    ```ptrhon
    const mongoose = require("mongoose")
    const glob = require("glob")
    
    /**
     * 设置  mongoose.set('useFindAndModify', false) 使 mongoose数据库查询与删除不报异常
     * 允许使用 * 符号，来写一个glob规则
     * resolve：将一系列路径或路径段解析为绝对路径
     */
     
    mongoose.set('useFindAndModify', false)
    const { resolve } = require("path")
    
    // 引入所有定义的schema
    exports.initSchemas = () => {
        glob.sync(resolve(__dirname, "./schema/", "**/*.js")).forEach(require)
    }

    exports.connect = () => {
        // 连接数据库
        mongoose.connect(db)
        let maxConnectTimes = 0
        return new Promise((resolve, reject) => {
            // 数据库连接事件监听
            mongoose.connection.on("disconnected", err => {
                console.log("数据库断开")
                if (maxConnectTimes < 3) {
                    maxConnectTimes++
                    mongoose.connect(db)
                } else {
                    reject(err)
                    throw new Error("数据库断开")
                }
            })
            // 数据库连接错误
            mongoose.connection.on("error", err => {
                console.log("数据库错误")
                if (maxConnectTimes < 3) {
                    maxConnectTimes++
                    mongoose.connect(db)
                } else {
                    reject(err)
                    throw new Error("数据库错误")
                }
            })
            // 数据库连接打开时，只需要连接一次once
            mongoose.connection.once("open", () => {
                console.log('MongoDB Connected successfully!')
                resolve()
            })
        })
    }
    ```

3. 

#### App

一个规范有序的目录更富有表现性与逻辑性，让人耳目一新，简单上手。所有文件是以 `app`为根路径。

    ```
    ├── routes  // 路由
    ├──── index.js  // 路由导入文件
    ├──── home.js  // home路由
    ├──── users.js  //  用户路由
    ├── controllers // 控制器
    ├──── home.js  // home
    ├──── users.js  //  users控制器
    ├── database // 数据库
    ├──── schema // 数据模型
    ├──── init.js // 数据库连接设置
    ```

##### controllers控制器

**Controller控制器**，是MVC中的部分C，此处的控制器主要负责功能处理部分：

    1. 收集、验证请求参数并绑定到命令对象；
    2. 处理业务，并将业务模块返回给路由。

1. users.js控制器

    ```python
    const db = [{ name: "lx" }]
    
    class UsersControl {
        find(ctx) {
            ctx.body = db
        }
        findById(ctx) {
            ctx.body = db[ctx.params.id * 1]
        }
        create(ctx) {
            db.push(ctx.request.body)
            ctx.body = ctx.request.body
        }
        update(ctx) {
            db[ctx.params.id * 1] = ctx.request.body
            ctx.body = ctx.request.body
        }
        delete(ctx) {
            db.splice(ctx.params.id * 1, 1)
            ctx.status = 204
        }
    }
    
    module.exports = new UsersControl()
    ```


##### routes路由

将每个功能模块拆分为一个个独立的路由，有助于使代码结构易懂。其中，最重要的是 **`路由导入文件index.js`**， 它将所有的路由通过脚本引入，不需要一个个的引入，减少代码，使其上档次~。

1. **index.js**

    ```python
    const fs = require("fs")
    
    module.exports = (res) => {
        fs.readdirSync(__dirname).forEach(file => {
            if (file === "index.js") return
            const route = require(`./${file}`)
            res.use(route.routes()).use(route.allowedMethods()) 
        })
    }
    ```
    **`allowedMethods`**， 顾名思义，就是当前接口允许运行的`method`。比如，一个提供数据接的接口，设置为 `GET`， 当客户端发送 `POST`请求时就会返回错误信息。
    
    然后在 `index.js` 中导入并注册。
    
    ```python
    const router = require('./routes')
    
    router(app)
    ```
    
2. 业务路由（如user.js）

    每个业务路由都需导入 **Koa-router ：**  `const Router = require("koa-router")`
    
    添加路由前缀，方便更改和复用：`const router = new Router({ prefix: "/users" })`
    
    在业务路由中导入相对应的控制器，即可完成对业务控制器的融洽结合，完成其具体业务功能：
    
    ```python
    const { find, findById, create, update, delete: del } = require("../controllers/users")
    
    router.get("/", find)
    router.post("/", create)
    router.get("/:id", findById)
    router.put("/:id", update)
    router.delete("/:id", del)
    
    module.exports = router
    ```


    
7.3