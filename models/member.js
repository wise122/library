const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    borrowedBooks: [
        {
            bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
            borrowDate: { type: Date }
        }
    ],
    penaltyEndDate: { type: Date }
});

module.exports = mongoose.model('Member', memberSchema);
