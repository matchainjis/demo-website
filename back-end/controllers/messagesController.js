const messageModel = require("../model/messageModel");

module.exports.addMessage = async (req, res, next) => {
    try {
        const { from, to, message } = req.body;
        if (!from || !to || !message) {
            return res.status(400).json({ msg: "Missing required fields" });
        }
        const data = await messageModel.create({
            message: { text: message },
            users: [from, to],
            sender: from,
        });
        if (data) return res.json({ msg: "Message added successfully." });
        return res.json({ msg: "Failed to add messages to the database" });
    } catch (ex) {
        next(ex);
    }
};
module.exports.getAllMessage = async (req, res, next) => {
    try {
        const { from, to } = req.body;

        console.log("📥 Incoming getAllMessage request");
        console.log("👉 From:", from);
        console.log("👉 To:", to);

        const messages = await messageModel
            .find({
                users: {
                    $all: [from, to],
                },
            })
            .sort({ updatedAt: 1 });

        console.log(`🔎 Found ${messages.length} messages between ${from} and ${to}`);

        const projectMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
            };
        });

        console.log("📤 Sending messages:", projectMessages);


        res.json(projectMessages);
    } catch (ex) {
        next(ex);
    }
};