const Topic = require("../database/schema/Topics")

class topicControl {
    async find(ctx) {
        /**
         * limit：每页 perPage 项
         * skip：跳过前面 page * per_page 项，返回从page * per_page + 1项到 ( page + 1) * per_page
         * find(): 模糊搜索 
         */
        const { per_page = 2 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        ctx.body = await Topic.find({ name: new RegExp(ctx.query.keyword) }).limit(perPage).skip(page * per_page)
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(";").filter(f => f).map(f => " +" + f).join("")
        const topic = await Topic.findById(ctx.params.id).select(selectFields)
        if (!topic) ctx.throw(404, "话题不存在")
        ctx.body = { data: topic }
    }
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false },
        })
        const topic = await new Topic(ctx.request.body).save()
        ctx.body = topic
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false },
        })
        const topic = await Topic.findOneAndUpdate(ctx.params.id, ctx.request.body)
        if (!topic) ctx.throw(404, "话题不存在")
        ctx.body = topic
    }
}

module.exports = new topicControl()
