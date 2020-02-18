const path = require("path")
const fse = require("fs-extra")

const UPLOAD_DIR = path.resolve(__dirname, "..", "target") // 当前目录下的上层目录target
const SIZE = 1 * 1024 * 1024; // 1M

const pipeStream = (path, writeStream) => {
  new Promise(resolve => {
    const readStream = fse.createReadStream(path)
    // 创建文件可读流
    readStream.on("end", () => {
      fse.unlinkSync(path) // 删除文件
      resolve()
    })
    readStream.pipe(writeStream)
  })
}

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
    const { chunk } = ctx.request.files
    const { hash, fileName, fileHash } = ctx.request.body
    const fileName_ = fileName.slice(fileName.lastIndexOf("."), fileName.length)
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${fileName_}`)
    const chunkDir = path.resolve(UPLOAD_DIR, fileHash) // 目录地址
    if (fse.existsSync(filePath)) {
      ctx.body = {
        code: 200,
        data: {
          message: "File exist"
        }
      }
      return
    }
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirs(chunkDir)
    }
    await fse.move(chunk.path, path.resolve(chunkDir, hash))

    // 合并文件块
    const chunkPaths = await fse.readdir(chunkDir)
    chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1])

    await Promise.all(
      chunkPaths.map((chunkPath, index) => {
        pipeStream(
          path.resolve(chunkDir, chunkPath),
          fse.createWriteStream(filePath, {
            start: index * SIZE,
            end: (index + 1) * SIZE
          })
        )
      })
    )
    fse.rmdir(chunkDir) // 合并后删除保存切片的目录

    ctx.body = {
      code: 200,
      data: {
        message: "Received file chunk"
      }
    }
  }
}

module.exports = new bigFileUpload()