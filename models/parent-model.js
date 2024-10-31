const mongoose = require('mongoose');

const ParentSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    circles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'circle' }], 
    child_school_name: { type: String, required: true }, 
    child_class: { type: String, required: true }, 
    child_section: { type: String, required: true }, 
    society: { type: String, default: null } 
    
}, { timestamps: true });

module.exports = mongoose.model('parent', ParentSchema);

