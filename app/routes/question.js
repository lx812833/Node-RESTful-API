const jwt = require("koa-jwt")
const Router = require("koa-router")

const router = new Router({ prefix: "/questions" })
const {
    find, findById, create,
    update, delete: del,
    checkQuestionExist, checkQuestioner
} = require("../controllers/question")

const { secret } = require("../config")
const auth = jwt({ secret });

router.get("/", auth, find)

router.post("/", auth, create)

router.get("/:id", auth, checkQuestionExist, findById)

//auth: 添加认证、授权中间件
router.patch("/:id", auth, checkQuestionExist, checkQuestioner, update)

router.delete("/:id", auth, checkQuestionExist, checkQuestioner, del)

module.exports = router