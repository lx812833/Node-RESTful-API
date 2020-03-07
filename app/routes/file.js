const Router = require("koa-router")

const router = new Router({ prefix: "/file" })

const { verify, chunkUpload } = require("../controllers/file")
const { auth } = require("../config")

router.post("/verify", verify)
router.post("/", chunkUpload)


module.exports = router