const mongoose = require("mongoose")
const { Schema } = mongoose

const commentSchema = new Schema({
    __v: { // 设置取消返回__v字段
        type: Number,
        select: false
    },
    content: {
        type: String,
        required: true
    },
    commentator: {
        type: Schema.Types.ObjectId, ref: "User",
        required: false
    },
    // 问题与回答一对多
    questionId: {
        type: String,
        required: true
    },
    answerId: {
        type: String,
        required: true
    },
    rootCommentId: {
        type: String
    },
    replyTo: {
        type: Schema.Types.ObjectId, ref: "User"
    }
}, { timestamps: true })

module.exports = Comment = mongoose.model("Comment", commentSchema)