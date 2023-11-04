const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    partisipants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ],
    messages: [
        {
            sender: {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            },
            reciver: {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            },
            text: {
                type: String
            },
            type: {
                type: String,
                enum: ["Text", "Image", "Video", "Link", "Doc"]
            },
            createdAt: {
                type: Date,
                default: Date.now()
            },
            edited: {
                type: Boolean,
                default: false
            }
        }
    ]
});

module.exports = mongoose.model("OneToOneMessage", schema);
