const Router = require("koa-router")

const router = new Router({ prefix: "/image" })

const { upload } = require("../controllers/home")

router.post("/", upload)


module.exports = router