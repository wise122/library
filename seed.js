const mongoose = require('mongoose');
const Book = require('./models/book');
const Member = require('./models/member');

const books = [
    {
        code: "JK-45",
        title: "Harry Potter",
        author: "J.K Rowling",
        stock: 1
    },
    {
        code: "SHR-1",
        title: "A Study in Scarlet",
        author: "Arthur Conan Doyle",
        stock: 1
    },
    {
        code: "TW-11",
        title: "Twilight",
        author: "Stephenie Meyer",
        stock: 1
    },
    {
        code: "HOB-83",
        title: "The Hobbit, or There and Back Again",
        author: "J.R.R. Tolkien",
        stock: 1
    },
    {
        code: "NRN-7",
        title: "The Lion, the Witch and the Wardrobe",
        author: "C.S. Lewis",
        stock: 1
    },
];

const members = [
    {
        code: "M001",
        name: "Angga",
    },
    {
        code: "M002",
        name: "Ferry",
    },
    {
        code: "M003",
        name: "Putri",
    },
];

mongoose.connect('mongodb+srv://adityabahrul233:Zv1BAHd19wCxaWsy@library.rotwgw3.mongodb.net/?retryWrites=true&w=majority&appName=library', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    await Book.deleteMany({});
    await Book.insertMany(books);
    await Member.deleteMany({});
    await Member.insertMany(members);
    console.log('Books and Members seeded successfully');
    mongoose.disconnect();
}).catch(err => {
    console.log(err);
});
