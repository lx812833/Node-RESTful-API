const jsonwebtoken = require("jsonwebtoken")

const User = require("../database/schema/Users")
const { secret } = require("../config")

class UsersControl {
    async find(ctx) {
        ctx.body = await User.find()
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(";").filter(f => f).map(f => " +" + f).join("")
        /**
         * select: 请求参数选择字段
         */
        const user = await User.findById(ctx.params.id).select(selectFields)
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = { data: user }
    }
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        });
        /**
         * 409状态码: 冲突
         * findOne：唯一性校验，确保用户唯一性
         */
        const { name } = ctx.request.body
        const repeatedUser = await User.findOne({ name })
        if (repeatedUser) ctx.throw(409, "用户已存在")
        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false }
        });
        const user = await User.findOneAndUpdate(ctx.params.id, ctx.request.body)
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = user
    }
    async delete(ctx) {
        const user = await User.findOneAndDelete(ctx.params.id)
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = user
    }
    async login(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const user = await User.findOne(ctx.request.body)
        if (!user) ctx.throw(401, "用户名或密码不正确")
        const { _id, name } = user
        /**
         * sign: Function token签名
         * secret: 秘钥
         * expiresIn: 过期时间 1天
         */
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
        ctx.body = { token, _id, name }
    }
    async listFollowing(ctx) {
        /**
         * populate: 引用其它集合中的文档(schema)
         */
        const user = await User.findById(ctx.params.id).select("+following").populate("following")
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = user.following
    }
    async listFollowers(ctx) {
        const users = await User.find({ following: ctx.params.id })
        ctx.body = users
    }
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id)
        if (!user) ctx.throw(404, "用户不存在")
        await next()
    }
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+following")
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id) // 关注者列表
            me.save()
        }
        ctx.status = 204
    }
    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+following")
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            me.following.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) ctx.throw(403, "没有权限")
        await next()
    }
}
module.exports = new UsersControl()