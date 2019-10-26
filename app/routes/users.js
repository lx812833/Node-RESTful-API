const jwt = require("koa-jwt")
const Router = require("koa-router")

const router = new Router({ prefix: "/users" })
const {
    find, findById, create,
    update, delete: del, login,
    checkOwner, listFollowing, listFollowers,
    checkUserExist, follow, unfollow,
    followTopics, unfollowTopics, listFollowingTopics
} = require("../controllers/users")

const { checkTopicExist } = require("../controllers/topics")
const { secret } = require("../config")
const auth = jwt({ secret });

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


module.exports = router