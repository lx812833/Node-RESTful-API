const mongoose = require("mongoose")
const { Schema } = mongoose

const answerSchema = new Schema({
    __v: { // 设置取消返回__v字段
        type: Number,
        select: false
    },
    content: {
        type: String,
        required: true
    },
    answerer: {
        type: Schema.Types.ObjectId, ref: "User",
        required: false
    },
    // 问题与回答一对多
    questionId: {
        type: String,
        required: true
    },
    // 投票数
    voteCount: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true })

module.exports = Answer = mongoose.model("Answer", answerSchema)