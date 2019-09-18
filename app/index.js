const Koa = require("Koa")
const bodyParser = require("koa-bodyparser")
const jsonError = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')

const app = new Koa()

const router = require('./routes')

app.use(jsonError({
    postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))

app.use(bodyParser())
app.use(parameter(app))
router(app) // 批量读取并注册

app.listen(3000, () => {
    console.log(`Server is running on 3000`)
})