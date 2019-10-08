const mongoose = require("mongoose")
const { Schema } = mongoose

let objectId = Schema.Types.ObjectId

const userSchema = new Schema({
    __v: { // 设置取消返回__v字段
        type: Number,
        select: false
    },
    userId: {
        type: objectId  // 主键
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false // 默认返回，设置为false后不返回密码字段
    }
})

module.exports = User = mongoose.model("User", userSchema)