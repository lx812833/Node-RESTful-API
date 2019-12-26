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
        select: true // 默认返回，设置为false后不返回该字段
    },
    questioner: {
        type: Schema.Types.ObjectId, ref: "User",
        required: false
    },
    // 一个问题话题有限，但一个话题问题可能无限，所以在问题schema里设置与话题多对多关系
    topics: {
        type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
        select: false
    }
}, { timestamps: true })

module.exports = Question = mongoose.model("Question", questionSchema)