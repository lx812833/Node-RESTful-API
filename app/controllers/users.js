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
        const users = await User.find({ name: new RegExp(ctx.query.keyword) }).limit(perPage).skip(page * perPage)
        ctx.body = {
            code: 200,
            data: users
        }
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
        const item = await User.findById(ctx.state.user._id).select("+following")
        if (!item.following.map(id => id.toString()).includes(ctx.params.id)) {
            item.following.push(ctx.params.id) // 关注者列表
            item.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "关注成功"
            }
        }
    }
    async unfollow(ctx) {
        const item = await User.findById(ctx.state.user._id).select("+following")
        const index = item.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            item.following.splice(index, 1)
            item.save()
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
        const item = await User.findById(ctx.state.user._id).select("+followingTopics")
        if (!item.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            item.followingTopics.push(ctx.params.id) // 关注者列表
            item.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "关注成功"
            }
        }
    }
    async unfollowTopics(ctx) {
        const item = await User.findById(ctx.state.user._id).select("+followingTopics")
        const index = item.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            item.followingTopics.splice(index, 1)
            item.save()
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
    async likeAnswers(ctx, next) {
        const item = await User.findById(ctx.state.user._id).select("+likingAnswers")
        if (!item.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            item.likingAnswers.push(ctx.params.id)
            item.save()
            /**
             * $inc：字段更新操作
             */
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
        }
        ctx.body = {
            code: 200,
            data: {
                message: "赞一个"
            }
        }
        await next()
    }
    async unlikeAnswers(ctx) {
        const item = await User.findById(ctx.state.user._id).select("+likingAnswers")
        const index = item.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            item.likingAnswers.splice(index, 1)
            item.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
        }
        ctx.body = {
            code: 200,
            data: {
                message: "取消成功"
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
    async dislikeAnswers(ctx, next) {
        const item = await User.findById(ctx.state.user._id).select("+dislikingAnswers")
        if (!item.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            item.dislikingAnswers.push(ctx.params.id) // 点赞列表
            item.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "踩一个"
            }
        }
        await next()
    }
    async undislikeAnswers(ctx) {
        const item = await User.findById(ctx.state.user._id).select("+dislikingAnswers")
        const index = item.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            item.dislikingAnswers.splice(index, 1)
            item.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "取消成功"
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
    // 收藏答案
    async collectAnswer(ctx) {
        const item = await User.findById(ctx.state.user._id).select('collectingAnswers')
        if (!item.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            item.collectingAnswers.push(ctx.params.id)
            item.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "收藏成功"
            }
        }
    }
    async uncollectAnswer(ctx) {
        const item = await User.findById(ctx.state.user._id).select("+collectingAnswers")
        const index = item.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index !== -1) {
            item.collectingAnswers.splice(index, 1)
            item.save()
        }
        ctx.body = {
            code: 200,
            data: {
                message: "取消成功"
            }
        }
    }
    async listCollectingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('collectingAnswers').populate('collectingAnswers')
        if (!user) ctx.throw(404, "用户不存在")
        ctx.body = {
            code: 200,
            data: {
                collects: user.collectingAnswers
            }
        }
    }
}
module.exports = new UsersControl()