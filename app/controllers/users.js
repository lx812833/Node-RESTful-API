const jsonwebtoken = require("jsonwebtoken")

const User = require("../database/schema/Users")
const Question = require("../database/schema/Questions")
const Answer = require("../database/schema/Answer")

const { secret } = require("../config")

class UsersControl {
    async find(ctx) {
        const { per_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        ctx.body = await User.find({ name: new RegExp(ctx.query.keyword) }).limit(perPage).skip(page * perPage)
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(";").filter(f => f).map(f => " +" + f).join("")
        /**
         * select: 请求参数选择字段
         */
        const user = await User.findById(ctx.params.id).select(selectFields)
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: { user }
        }
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
        ctx.body = {
            code: 200,
            data: { name: user.name }
        } // 只返回用户姓名
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false }
        });
        const user = await User.findOneAndUpdate(ctx.params.id, ctx.request.body)
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: { user }
        }
    }
    async delete(ctx) {
        const user = await User.findOneAndDelete(ctx.params.id)
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: { name: user.name }
        }
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
        ctx.body = {
            code: 200,
            data: {
                token,
                _id,
                name
            }
        }
    }
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id)
        if (!user) ctx.throw(404, "用户不存在")
        await next()
    }
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) ctx.throw(403, "没有权限")
        await next()
    }
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+following")
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id) // 关注者列表
            me.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "关注成功"
            }
        }
    }
    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+following")
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            me.following.splice(index, 1)
            me.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "取消成功"
            }
        }
    }
    async listFollowing(ctx) {
        /**
         * populate: 引用其它集合中的文档(schema)
         */
        const user = await User.findById(ctx.params.id).select("+following").populate("following")
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: user.following
        }
    }
    async listFollowers(ctx) {
        const users = await User.find({ following: ctx.params.id })
        ctx.body = {
            code: 200,
            data: {
                followers: users
            }
        }
    }
    async followTopics(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+followingTopics")
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id) // 关注者列表
            me.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "关注成功"
            }
        }
    }
    async unfollowTopics(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+followingTopics")
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            me.followingTopics.splice(index, 1)
            me.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "取消关注成功"
            }
        }
    }
    async listFollowingTopics(ctx) {
        /**
         * populate: 引用其它集合中的文档(schema)
         */
        const user = await User.findById(ctx.params.id).select("+followingTopics").populate("followingTopics")
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: user.followingTopics
        }
    }
    async listQuestions(ctx) {
        const question = await Question.find({ questioner: ctx.params.id })
        ctx.body = {
            code: 200,
            data: {
                questions: question
            }
        }
    }
    // 喜欢与不喜欢
    async likeAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+likingAnswers")
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id)
            me.save()
            /**
             * $inc：字段更新操作
             */
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
        }
        ctx.body = {
            code: 200,
            data: {
                message: "喜欢成功"
            }
        }
    }
    async unlikeAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+likingAnswers")
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            me.likingAnswers.splice(index, 1)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
        }
        ctx.body = {
            code: 200,
            data: {
                message: "取消喜欢成功"
            }
        }
    }
    async listLikingAnswers(ctx) {
        /**
         * populate: 引用其它集合中的文档(schema)
         */
        const user = await User.findById(ctx.params.id).select("+likingAnswers").populate("likingAnswers")
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: {
                answers: user.likingAnswers
            }
        }
    }
    // 攒与踩
    async dislikeAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+dislikingAnswers")
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id) // 点赞列表
            me.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "点赞成功"
            }
        }
    }
    async undislikeAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select("+dislikingAnswers")
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            me.dislikingAnswers.splice(index, 1)
            me.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "取消点赞成功"
            }
        }
    }
    async listDislikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: {
                answers: user.dislikingAnswers
            }
        }
    }
}
module.exports = new UsersControl()