const Koa = require("Koa")
const koaBody = require("koa-body")
const koaStatic = require("koa-static")
const jsonError = require('koa-json-error')
const parameter = require('koa-parameter')
const cors = require('koa2-cors')
const path = require("path")

const app = new Koa()

// 导入路由
const router = require('./routes')

// 连接数据库
const { connect, initSchemas } = require("./database/init.js");
; (async () => {
    await connect()
    initSchemas()
})()

// 生成图片链接
app.use(koaStatic(path.join(__dirname, "public")))

app.use(jsonError({
    postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))

//文件上传
app.use(koaBody({
    multipart: true, // 支持文件上传
    formidable: {
        uploadDir: path.join(__dirname, "/public/uploads"),   // 上传文件目录
        keepExtensions: true, // 保留扩展名
        maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
        onFileBegin: (name, file) => { // 文件上传前的设置

        },
    }
}))

app.use(parameter(app))

// 跨域
app.use(cors())
// 路由 批量读取并注册
router(app)

app.listen(3000, () => {
    console.log(`Server is running on 3000`)
})