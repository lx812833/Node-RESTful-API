const fs = require("fs")

module.exports = (res) => {
    fs.readdirSync(__dirname).forEach(file => {
        if (file === "index.js") return
        const route = require(`./${file}`)
        res.use(route.routes()).use(route.allowedMethods()) //allowedMethods  响应option
    })
}