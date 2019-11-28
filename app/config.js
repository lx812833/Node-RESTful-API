const jsonwebtoken = require("jsonwebtoken")

class Config {
    async auth(ctx, next) {
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

module.exports = new Config()
