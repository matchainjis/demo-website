const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,  // ✅ Ensures one user per address
    },
    theWalletAddress: {
        type: String,
        required: true,
        unique: true,  // ✅ Ensures one user per address
        default: function () {
            return this.address;
        }
    },
    username: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: false,
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        min: 8,
    },
    isAvatarImageSet: {
        type: Boolean,
        default: false,
    },
    avatarImage: {
        type: String,
        default: "",
    }
}, { timestamps: true });

module.exports = mongoose.model("Users", userSchema);