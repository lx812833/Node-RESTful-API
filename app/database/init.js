const mongoose = require("mongoose")
const glob = require("glob")

mongoose.set('useFindAndModify', false)
const db = "mongodb://localhost/zhi-hu-api"
/**
 * 允许使用 * 符号，来写一个glob规则
 * resolve：将一系列路径或路径段解析为绝对路径
 */

const { resolve } = require("path")

// 引入所有定义的schema
exports.initSchemas = () => {
    glob.sync(resolve(__dirname, "./schema/", "**/*.js")).forEach(require)
}
exports.connect = () => {
    // 连接数据库
    mongoose.connect(db)
    let maxConnectTimes = 0
    return new Promise((resolve, reject) => {
        // 数据库连接事件监听
        mongoose.connection.on("disconnected", err => {
            console.log('***********数据库断开***********')
            if (maxConnectTimes < 3) {
                maxConnectTimes++
                mongoose.connect(db)
            } else {
                reject(err)
                throw new Error("数据库断开")
            }
        })

        // 数据库出现错误时
        mongoose.connection.on("error", err => {
            console.log('***********数据库错误***********')
            if (maxConnectTimes < 3) {
                maxConnectTimes++
                mongoose.connect(db)
            } else {
                reject(err)
                throw new Error("数据库断开")
            }
        })

        // 数据库连接超时
        mongoose.connection.once('open', () => {
            console.log('MongoDB Connected successfully!')
            resolve()
        })
    })
}