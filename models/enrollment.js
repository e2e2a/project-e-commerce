var mongoose = require("mongoose");

var schema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
    },
    courseTitle:{
        type: String,
    },
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    age: {
        type: String,
    },
    contact: {
        type: String,
    },
    fatherName: {
        type: String,
    },
    motherName: {
        type: String,
    },
    level: {
        type: String,
    },
    schedule: {
        type: [String],
        default: []
    },
    time: {
        type: String,
    },
    dateEnrolling: {
        type: String,
    },
    dateApproved: {
        type: String,
    },
    dateDisapproved: {
        type: String,
    },
    dateEnd: {
        type: String,
    },
    isApproved: {
        type: String,
    },
    status: {
        type: String,
    },
}, {
    versionKey: false,
    timestamps: true
}
); 
schema.set('toJSON', { getters: true });

module.exports = mongoose.model('Enrollment', schema, 'Enrollment');