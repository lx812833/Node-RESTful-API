const Koa = require("Koa")
const Router = require("koa-router")
const router = new Router()
const app = new Koa()

const userRouter = new Router({ prefix: "/users" })

router.get("/", ctx => {
    ctx.body = "主页面"
})

router.get("/users", (ctx) => {
    ctx.body = "用户列表页面"
})
router.get("/users/:id", ctx => {
    ctx.body = `当前${ctx.params.id}用户`
})

app.use(async (ctx, next) => {
    ctx.body = "hello world"
    await next()
})

app.use(router.routes())

app.listen(3000, () => {
    console.log(`Server is running on 3000`)
})