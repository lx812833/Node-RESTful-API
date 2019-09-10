const db = [{ name: "lx" }]
class UsersControl {
    find(ctx) {
        ctx.body = db
    }
    findById(ctx) {
        ctx.body = db[ctx.params.id * 1]
    }
    create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            age: { type: 'number', required: false }
        });
        db.push(ctx.request.body)
        ctx.body = ctx.request.body
    }
    update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            age: { type: 'number', required: false }
        });
        db[ctx.params.id * 1] = ctx.request.body
        ctx.body = ctx.request.body
    }
    delete(ctx) {
        db.splice(ctx.params.id * 1, 1)
        ctx.status = 204
    }

}
module.exports = new UsersControl()