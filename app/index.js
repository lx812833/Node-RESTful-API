const Koa = require("Koa")
const bodyParser = require("koa-bodyparser")
const jsonError = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')

const app = new Koa()

// 导入路由
const router = require('./routes')

// 连接数据库
const { connect, initSchemas } = require("./database/init.js");
; (async () => {
    await connect()
    initSchemas()
})()


app.use(jsonError({
    postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))

app.use(bodyParser())
app.use(parameter(app))
router(app) // 批量读取并注册

app.listen(3000, () => {
    console.log(`Server is running on 3000`)
})