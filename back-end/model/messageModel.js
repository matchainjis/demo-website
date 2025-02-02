const { default: mongoose } = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: true,
            },
        },
        users: Array,
        sender: {
            // type: mongoose.Schema.Types.ObjectId,
            type: String, // Change this to String
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model("Messages", messageSchema);