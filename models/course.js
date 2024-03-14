var mongoose = require("mongoose");


var schema = mongoose.Schema({
    imageURL: {
        type: String,
        trim: false
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
}, {
    versionKey: false,
    timestamps: true
}
); 
schema.set('toJSON', { getters: true });

module.exports = mongoose.model('Course', schema, 'Course');