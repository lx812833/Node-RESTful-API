const jwt = require("koa-jwt")
const Router = require("koa-router")

const router = new Router({ prefix: "/questions/:questionId/answers" })
const {
    find, findById, create,
    update, delete: del,
    checkAnswerExist, checkAnswerer
} = require("../controllers/answer")

const { secret } = require("../config")
const auth = jwt({ secret });

router.get("/", auth, find)

router.post("/", auth, create)

router.get("/:id", auth, checkAnswerExist, findById)

//auth: 添加认证、授权中间件
router.patch("/:id", auth, checkAnswerExist, checkAnswerer, update)

router.delete("/:id", auth, checkAnswerExist, checkAnswerer, del)

module.exports = router