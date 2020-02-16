const Router = require("koa-router")

const router = new Router({ prefix: "/file" })

const { verify, chunkUpload } = require("../controllers/file")
const { auth } = require("../config")

router.post("/verify", auth, verify)
router.post("/", auth, chunkUpload)


module.exports = router