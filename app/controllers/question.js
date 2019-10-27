const Question = require("../database/schema/Questions")

class QuestionControl {
    async find(ctx) {
        /**
         * limit：每页 perPage 项
         * skip：跳过前面 page * per_page 项，返回从page * per_page + 1项到 ( page + 1) * per_page
         * find(): 模糊搜索
         * $or：mongoose多条件模糊查询，其值是一个数组
         */
        const { per_page = 2 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        const keyword = new RegExp(ctx.query.keyword)
        const questions = await Question.find({ $or: [{ title: keyword }, { description: keyword }] }).limit(perPage).skip(page * per_page)
        ctx.body = {
            code: 200,
            data: {
                questions
            }
        }
    }
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select("+questioner")
        if (!question) ctx.throw(404, "问题不存在")
        // 在 update 方法里共用一次findById
        ctx.state.question = question
        await next()
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(";").filter(f => f).map(f => " +" + f).join("")
        const question = await Question.findById(ctx.params.id).select(selectFields).populate("questioner")
        if (!question) ctx.throw(404, "话题不存在")
        ctx.body = {
            code: 200,
            data: {
                question
            }
        }
    }
    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false },
        })
        const question = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save()
        ctx.body = {
            code: 200,
            data: {
                question
            }
        }
    }
    // 鉴别用户
    async checkQuestioner(ctx, next) {
        const { question } = ctx.state
        if (question.questioner.toString() !== ctx.state.user._id) {
            ctx.throw(403, "没有权限")
        }
        await next()
    }
    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false },
        })
        /**
         * 在与 checkQuestionExist中共用了findById方法，所以不需再findById了
         *  const question = await Question.findOneAndUpdate(ctx.params.id, ctx.request.body)
         *  if (!question) ctx.throw(404, "话题不存在")
         */

        await ctx.state.question.update(ctx.request.body)
        ctx.body = {
            code: 200,
            data: {
                question: ctx.state.question
            }
        }
    }
    async delete(ctx) {
        await Question.findByIdAndRemove(ctx.params.id)
        ctx.body = {
            code: 200,
            data: {
                message: "删除成功"
            }
        }
    }
}

module.exports = new QuestionControl()
