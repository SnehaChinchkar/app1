const mongoose = require('mongoose');

const SocialCircleSchema = mongoose.Schema({
    name: { type: String, required: true },
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'parent' }], 
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
    member_count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('circle', SocialCircleSchema);