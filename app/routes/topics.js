const jwt = require("koa-jwt")
const Router = require("koa-router")

const router = new Router({ prefix: "/topics" })
const {
    find, findById, create, update,
} = require("../controllers/topics")

const { secret } = require("../config")
const auth = jwt({ secret });

router.get("/", find)

router.post("/", auth, create)

router.get("/:id", auth, findById)

//auth: 添加认证、授权中间件
router.patch("/:id", auth, update)

module.exports = router