const Router = require("koa-router")

const router = new Router({ prefix: "/users" })
const {
    find, findById, create,
    update, delete: del, login,
    checkOwner, listFollowing, listFollowers,
    checkUserExist, follow, unfollow,
    followTopics, unfollowTopics, listFollowingTopics,
    listQuestions,
    likeAnswers, unlikeAnswers, listLikingAnswers,
    dislikeAnswers, undislikeAnswers, listDislikingAnswers,
    collectAnswer, uncollectAnswer, listCollectingAnswers,
} = require("../controllers/users")

const { checkTopicExist } = require("../controllers/topics")
const { checkAnswerExist } = require("../controllers/answer")
const { auth } = require("../config")

router.get("/", find)

router.post("/", create)

router.get("/:id", auth, checkOwner, findById)

//auth: 添加认证、授权中间件
//checkOwner: 修改、删除用户添加认证权限
router.patch("/:id", auth, checkOwner, update)

router.delete("/:id", auth, checkOwner, del)

router.post("/login", login)

// 关注者列表 
router.get("/:id/following", auth, checkOwner, listFollowing)

router.get("/:id/followers", auth, checkOwner, listFollowers)

router.put("/following/:id", auth, checkUserExist, follow)

router.delete("/following/:id", auth, checkUserExist, unfollow)

router.get("/:id/followingTopics", auth, checkOwner, listFollowingTopics)

router.put("/followingTopics/:id", auth, checkTopicExist, followTopics)

router.delete("/followingTopics/:id", auth, checkTopicExist, unfollowTopics)

router.get("/:id/questions", auth, listQuestions)

// 赞与踩互斥

router.get("/:id/likingAnswers", auth, checkOwner, listLikingAnswers)

router.put("/likingAnswers/:id", auth, checkAnswerExist, likeAnswers, undislikeAnswers)

router.delete("/likingAnswers/:id", auth, checkAnswerExist, unlikeAnswers)

router.get("/:id/dislikingAnswers", auth, checkOwner, listDislikingAnswers)

router.put("/dislikingAnswers/:id", auth, checkAnswerExist, dislikeAnswers, unlikeAnswers)

router.delete("/dislikingAnswers/:id", auth, checkAnswerExist, undislikeAnswers)

// 收藏答案

router.get("/:id/collectAnswers", auth, checkOwner, listCollectingAnswers)

router.put("/collectAnswers/:id", auth, checkAnswerExist, collectAnswer)

router.delete("/collectAnswers/:id", auth, checkAnswerExist, uncollectAnswer)

module.exports = router