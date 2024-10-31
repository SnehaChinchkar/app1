const mongoose = require('mongoose');

const ReplySchema = mongoose.Schema({
    parent_id_replying: { type: mongoose.Schema.Types.ObjectId, ref: 'parent', required: true }, 
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true }, 
    content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('reply', ReplySchema);

