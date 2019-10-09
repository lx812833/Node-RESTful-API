const jsonwebtoken = require("jsonwebtoken")

const User = require("../database/schema/Users")
const { secret } = require("../config")

class UsersControl {
    async find(ctx) {
        ctx.body = await User.find()
    }
    async findById(ctx) {
        const user = await User.findById(ctx.params.id)
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = user
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
         * expiresIn: 过期时间
         */
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
        ctx.body = { token }
    }

    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) ctx.throw(403, "没有权限")
        await next()
    }
}
module.exports = new UsersControl()