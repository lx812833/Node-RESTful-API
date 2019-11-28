const Router = require("koa-router")

const router = new Router({ prefix: "/questions/:questionId/answers/:answerId/comments" })
const {
    find, findById, create,
    update, delete: del,
    checkCommentsExist, checkCommentator
} = require("../controllers/comments")
const { auth } = require("../config")

router.get("/", auth, find)

router.post("/", auth, create)

router.get("/:id", auth, checkCommentsExist, findById)

router.patch("/:id", auth, checkCommentsExist, checkCommentator, update)

router.delete("/:id", auth, checkCommentsExist, checkCommentator, del)

module.exports = router