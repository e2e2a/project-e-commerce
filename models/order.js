var mongoose = require("mongoose");

var schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
    }],
    totalAmount: {
        type: Number,
        required: true
    },
}, {
    versionKey: false,
    timestamps: true
}
); 
schema.set('toJSON', { getters: true });

module.exports = mongoose.model('Order', schema, 'Order');
