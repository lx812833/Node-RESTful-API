const mongoose = require("mongoose")
const { Schema } = mongoose

let objectId = Schema.Types.ObjectId

const userSchema = new Schema({
    userId: {
        type: objectId  // 主键
    },
    name: {
        type: String,
        required: true
    }
})

module.exports = User = mongoose.model("User", userSchema)