const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    circle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'circle', required: true }, 
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'parent', required: true }, 
    content: { type: String, required: true }, 
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'parent' }], 
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'parent' }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reply' }] 
}, { timestamps: true });


module.exports = mongoose.model('post', PostSchema);

