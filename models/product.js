var mongoose = require("mongoose");


var schema = mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: Number,
        min: 0,
        get: value => (value / 100).toFixed(2),
        set: value => value * 100
    },
    category: {
        type: String,
    },
    brand: {
        type: String,
    },
    color: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    imageURL: {
        type: String,
        trim: false
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

module.exports = mongoose.model('Product', schema, 'Product');