const Answer = require("../database/schema/Answer")

class answerControl {
    async find(ctx) {
        const { per_page = 2 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        const keyword = new RegExp(ctx.query.keyword)
        const answers = await Answer.find({ content: keyword, questionId: ctx.params.questionId }).limit(perPage).skip(page * per_page)
        ctx.body = {
            code: 200,
            data: {
                answers
            }
        }
    }
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select("+answerer")
        if (!answer) {
            ctx.throw(404, "答案不存在")
        }
        // 只有删改查时才检查此逻辑，赞与踩不检查
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
            ctx.throw(404, "该问题不存在此答案")
        }
        ctx.state.answer = answer
        await next()
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(";").filter(f => f).map(f => " +" + f).join("")
        // 问题与答案一对多
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate("answerer")
        if (!answer) ctx.throw(404, "答案不存在")
        ctx.body = {
            code: 200,
            data: {
                answer
            }
        }
    }
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            questionId: { type: 'string', required: true },
        })
        const answerer = ctx.state.user._id
        const questionId = ctx.params.questionId
        const answer = await new Answer({ ...ctx.request.body, answerer, questionId }).save()
        ctx.body = {
            code: 200,
            data: {
                answer
            }
        }
    }
    // 鉴别用户
    async checkAnswerer(ctx, next) {
        const { answer } = ctx.state
        if (answer.answerer.toString() !== ctx.state.user._id) {
            ctx.throw(403, "没有权限")
        }
        await next()
    }
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            questionId: { type: 'string', required: true },
        })
        /**
         * 在与 checkAnswerExist中共用了findById方法，所以不需再findById了
         *  const answer = await Answer.findOneAndUpdate(ctx.params.id, ctx.request.body)
         *  if (!answer) ctx.throw(404, "话题不存在")
         */

        await ctx.state.answer.update(ctx.request.body)
        ctx.body = {
            code: 200,
            data: {
                answer: ctx.state.answer
            }
        }
    }
    async delete(ctx) {
        await Answer.findByIdAndRemove(ctx.params.id)
        ctx.body = {
            code: 200,
            data: {
                message: "删除成功"
            }
        }
    }
}

module.exports = new answerControl()
