const User = require("../database/schema/Users")

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
        });
        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true }
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

}
module.exports = new UsersControl()