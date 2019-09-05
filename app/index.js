const Koa = require("Koa")
const bodyParser = require("koa-bodyparser")

const app = new Koa()

const router = require('./routes')


app.use(bodyParser())
router(app) // 批量读取并注册

app.listen(3000, () => {
    console.log(`Server is running on 3000`)
})