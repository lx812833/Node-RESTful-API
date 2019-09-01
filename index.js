const Koa = require("Koa")
const app = new Koa()

app.use(async (ctx, next) => {
    ctx.body = "hello world"
})

app.listen(3000, () => {
    console.log(`Server is running on 3000`)
})