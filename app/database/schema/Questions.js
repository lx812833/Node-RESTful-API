const mongoose = require("mongoose")
const { Schema } = mongoose

const questionSchema = new Schema({
    __v: { // 设置取消返回__v字段
        type: Number,
        select: false
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        select: false // 默认返回，设置为false后不返回该字段
    },
    questioner: {
        type: Schema.Types.ObjectId, ref: "User",
        required: false
    },

})

module.exports = Question = mongoose.model("Question", questionSchema)