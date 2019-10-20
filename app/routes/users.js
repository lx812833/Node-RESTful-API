const jwt = require("koa-jwt")
const Router = require("koa-router")

const router = new Router({ prefix: "/users" })
const {
    find, findById, create,
    update, delete: del, login,
    checkOwner, listFollowing, listFollowers,
    follow, unfollow
} = require("../controllers/users")

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

router.put("/following/:id", auth, follow)

router.delete("/following/:id", auth, unfollow)


module.exports = router