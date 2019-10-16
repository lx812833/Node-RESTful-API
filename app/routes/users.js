const jwt = require("koa-jwt")
const Router = require("koa-router")

const router = new Router({ prefix: "/users" })
const {
    find, findById, create,
    update, delete: del, login,
    checkOwner
} = require("../controllers/users")

const { secret } = require("../config")
const auth = jwt({ secret });

router.get("/", find)

router.post("/", create)

router.get("/:id", auth, checkOwner, findById)

// 添加认证、授权中间件
// 修改、删除用户添加认证权限
router.patch("/:id", auth, checkOwner, update)

router.delete("/:id", auth, checkOwner, del)

router.post("/login", login)

module.exports = router