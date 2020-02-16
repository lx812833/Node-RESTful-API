const path = require("path")
const fse = require("fs-extra")

const UPLOAD_DIR = path.resolve(__dirname, "..", "target") // 当前目录下的上层目录target

class bigFileUpload {
  async verify(ctx) {
    const { fileName, fileHash } = ctx.request.body
    const ext = fileName.slice(fileName.lastIndexOf("."), fileName.length)
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)
    console.log("req, res", ext, filePath);
    if (fse.existsSync(filePath)) {
      ctx.body = {
        code: 200,
        data: {
          shouldUpload: false
        }
      }
    } else {
      ctx.body = {
        code: 200,
        data: {
          shouldUpload: true,
          uploadedList: []
        }
      }
    }
  }
  async chunkUpload(ctx) {
    console.log("切块上传", ctx.request.body)
    ctx.body = {
      code: 200,
      data: {
        data: ctx.request.body
      }
    }
  }
}

module.exports = new bigFileUpload()