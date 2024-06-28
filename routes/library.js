const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/book');
const Member = require('../models/member');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - code
 *         - title
 *         - author
 *         - stock
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the book
 *         code:
 *           type: string
 *           description: The code of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         stock:
 *           type: integer
 *           description: The stock of the book available in the library
 *       example:
 *         code: "JK-45"
 *         title: "Harry Potter"
 *         author: "J.K Rowling"
 *         stock: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Member:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the member
 *         name:
 *           type: string
 *           description: The name of the member
 *         borrowedBooks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: The id of the borrowed book
 *               borrowDate:
 *                 type: string
 *                 format: date-time
 *                 description: The date the book was borrowed
 *         penaltyEndDate:
 *           type: string
 *           format: date-time
 *           description: The date the penalty ends
 *       example:
 *         name: John Doe
 *         borrowedBooks:
 *           - bookId: 60b8d75fc25e410d1c8daeb1
 *             borrowDate: 2021-06-01T00:00:00.000Z
 *         penaltyEndDate: 2021-06-10T00:00:00.000Z
 */

/**
 * @swagger
 * /api/library/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Library]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book borrowed successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Member or Book not found
 *       500:
 *         description: Internal server error
 */
router.post('/borrow', async (req, res) => {
    const { memberId, bookId } = req.body;

    try {
        const member = await Member.findById(memberId);
        const book = await Book.findById(bookId);

        if (!member || !book) {
            return res.status(404).send('Member or Book not found');
        }

        if (member.penaltyEndDate && new Date() < member.penaltyEndDate) {
            return res.status(400).send('Member is under penalty');
        }

        if (member.borrowedBooks.length >= 2) {
            return res.status(400).send('Cannot borrow more than 2 books');
        }

        if (book.stock <= 0) {
            return res.status(400).send('Book not available');
        }

        member.borrowedBooks.push({ bookId: book._id, borrowDate: new Date() });
        await member.save();

        book.stock -= 1;
        await book.save();

        res.send('Book borrowed successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /api/library/return:
 *   post:
 *     summary: Return a book
 *     tags: [Library]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Member or Book not found
 *       500:
 *         description: Internal server error
 */
router.post('/return', async (req, res) => {
    const { memberId, bookId } = req.body;

    try {
        const member = await Member.findById(memberId);
        const book = await Book.findById(bookId);

        if (!member || !book) {
            return res.status(404).send('Member or Book not found');
        }

        const borrowedBook = member.borrowedBooks.find(b => b.bookId.toString() === book._id.toString());
        if (!borrowedBook) {
            return res.status(400).send('This book was not borrowed by the member');
        }

        const borrowDuration = (new Date() - borrowedBook.borrowDate) / (1000 * 60 * 60 * 24);
        if (borrowDuration > 7) {
            member.penaltyEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        }

        member.borrowedBooks = member.borrowedBooks.filter(b => b.bookId.toString() !== book._id.toString());
        await member.save();

        book.stock += 1;
        await book.save();

        res.send('Book returned successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /api/library/books:
 *   get:
 *     summary: Get all books
 *     tags: [Library]
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find({});
        res.send(books);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /api/library/members:
 *   get:
 *     summary: Get all members
 *     tags: [Library]
 *     responses:
 *       200:
 *         description: List of all members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
 *       500:
 *         description: Internal server error
 */
router.get('/members', async (req, res) => {
    try {
        const members = await Member.find({});
        res.send(members);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
