const mongoose = require("mongoose")
const fs = require("fs")

// 定义所连接的数据库
const db = "mongodb://localhost/zhi-hu-api"

// exports.initSchemas = () => {
//     fs.readdirSync(__dirname).forEach(file => {
//         const path = require(`./${file}`)
//     })
// }

exports.connect = () => {
    // 连接数据库
    mongoose.connect(db)
    let maxConnectTimes = 0
    return new Promise((resolve, reject) => {
        // 数据库连接事件监听
        mongoose.connection.on("disconnected", err => {
            console.log("数据库断开")
            if (maxConnectTimes < 3) {
                maxConnectTimes++
                mongoose.connect(db)
            } else {
                reject(err)
                throw new Error("数据库断开")
            }
        })
        // 数据库连接错误
        mongoose.connection.on("error", err => {
            console.log("数据库错误")
            if (maxConnectTimes < 3) {
                maxConnectTimes++
                mongoose.connect(db)
            } else {
                reject(err)
                throw new Error("数据库错误")
            }
        })
        // 数据库连接打开时，只需要连接一次once
        mongoose.connection.once("open", () => {
            console.log('MongoDB Connected successfully!')
            resolve()
        })
    })
}

// { useNewUrlParser: true }