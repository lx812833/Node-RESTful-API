const jsonwebtoken = require("jsonwebtoken")

const Config = {
    secret: "zhihu-jwt-secret",
    auth: async function (ctx, next) {
        let { token = '' } = ctx.request.header
        token = token.replace('Bearer ', '')
        try {
            const user = jsonwebtoken.verify(token, "zhihu-jwt-secret")
            ctx.state.user = user
        } catch (e) {
            ctx.throw(401, e.message)
        }
        await next()
    }
}

module.exports = Config