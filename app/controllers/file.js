const path = require("path")
const fse = require("fs-extra")
// const UPLOAD_DIR = path.resolve(__dirname, "/") // 当前目录下的上层目录target
const UPLOAD_DIR = path.resolve(__dirname, "..", "public/uploads") // 当前目录下的上层目录target

// 提取后缀名
const extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length);

// 返回已经上传切片名
const createUploadedList = async fileHash =>
  fse.existsSync(`${UPLOAD_DIR}/${fileHash}`) ? await fse.readdir(`${UPLOAD_DIR}/${fileHash}`) : [];

// 合并切片
const mergeFileChunk = async (filePath, fileHash) => {
  const chunkDir = `${UPLOAD_DIR}/${fileHash}`;
  const chunkPaths = await fse.readdir(chunkDir);
  await fse.writeFile(filePath, "");
  chunkPaths.forEach(chunkPath => {
    fse.appendFileSync(filePath, fse.readFileSync(`${chunkDir}/${chunkPath}`));
    fse.unlinkSync(`${chunkDir}/${chunkPath}`);
  });
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
};

class bigFileUpload {
  // 验证是否已上传/已上传切片下标
  async verify(ctx) {
    const { fileName, fileHash } = ctx.request.body
    const ext = extractExt(fileName)
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)
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
          uploadedList: await createUploadedList(fileHash)
        }
      }
    }
  }
  // 处理切片
  async chunkUpload(ctx) {
    const { chunk } = ctx.request.files
    const { hash, fileName, fileHash } = ctx.request.body
    const filePath = `${UPLOAD_DIR}/${fileHash}${extractExt(fileName)}`
    const chunkDir = `${UPLOAD_DIR}/${fileHash}` // 目录地址

    // 文件存在直接返回
    if (fse.existsSync(filePath)) {
      ctx.body = {
        code: 200,
        data: {
          message: "File exist"
        }
      }
      return
    }
    // 切片目录不存在，创建切片目录
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirs(chunkDir);
    }
    await fse.move(chunk.path, `${chunkDir}/${hash}`);
    await mergeFileChunk(filePath, fileHash);
    ctx.body = {
      code: 200,
      data: {
        message: "file merged success"
      }
    }
  }
}

module.exports = new bigFileUpload()