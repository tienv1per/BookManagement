const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        }, 
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        avatar: {
          type: String,
        }
    }, {timestamp: true}
)

module.exports = mongoose.model("Users", UserSchema);