const mongoose = require("mongoose")
const { Schema } = mongoose

const userSchema = new Schema({
    __v: { // 设置取消返回__v字段
        type: Number,
        select: false
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false // 默认返回，设置为false后不返回密码字段
    },
    avatar_url: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female'],  // 枚举性别
        default: 'male',
        required: true
    },
    headline: {
        type: String
    },
    locations: {
        type: [{ type: String }],   // 字符串数组
        select: false
    },
    business: {
        type: String,
        select: false
    },
    employments: {
        type: [{
            company: { type: String },
            job: { type: String }
        }],
        select: false
    },
    educations: {
        type: [{
            school: { type: String },
            major: { type: String },
            diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
            entrance_year: { type: Number },
            graduation_year: { type: Number }
        }],
        select: false
    },
    // 关注
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: "User" }],
        select: false
    },
    followingTopics: {
        type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
        select: false
    },
    // 攒
    likingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
        select: false
    },
    // 踩
    dislikingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
        select: false
    },
    // 收藏答案
    collectingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
        select: false
    }
})

module.exports = User = mongoose.model("User", userSchema)