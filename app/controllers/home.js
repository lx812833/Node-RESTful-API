const path = require("path")

class HomeControl {
    index(ctx) {
        ctx.body = `这是主页`
    }
    upload(ctx) {
        const file = ctx.request.files.file
        /**
         * 获取上传文件信息 ctx.request.files
         *  size	文件大小
            path	文件上传后的目录
            name	文件的原始名称
            type	文件类型
         * 
         */
        const basename = path.basename(file.path) // 解析图片相对路径
        // ctx.origin 域名
        ctx.body = { url: `${ctx.origin}/uploads/${basename}` }
    }
}

module.exports = new HomeControl()