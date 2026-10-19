
const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Check whether username already exists
    if (isValid(username)) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    // Register the new user
    users.push({
        username: username,
        password: password
    });

    return res.status(201).json({
        message: "User successfully registered"
    });
});


// Get the book list available in the shop

public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({
            message: "Book not found"
        });
    }
});
  
// Get book details based on author

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let matchingBooks = {};

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
            matchingBooks[isbn] = books[isbn];
        }
    });

    if (Object.keys(matchingBooks).length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({
            message: "No books found by this author"
        });
    }
});


// Get all books based on title

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let matchingBooks = {};

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
            matchingBooks[isbn] = books[isbn];
        }
    });

    if (Object.keys(matchingBooks).length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({
            message: "No books found with this title"
        });
    }
});


//  Get book review

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({
            message: "Book not found"
        });
    }
});


public_users.get('/async/books', async (req, res) => {
    try {
        const response = await axios.get(
            'http://localhost:5000/'
        );

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books",
            error: error.message
        });
    }
});


public_users.get('/async/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    axios.get(
        `http://localhost:5000/isbn/${encodeURIComponent(isbn)}`
    )
    .then((response) => {
        return res.status(200).json(response.data);
    })
    .catch((error) => {
        return res.status(error.response?.status || 500).json({
            message: "Error retrieving book by ISBN",
            error: error.message
        });
    });
});


public_users.get('/async/title/:title', async (req, res) => {
    try {
        const title = req.params.title;

        const response = await axios.get(
            `http://localhost:5000/title/${encodeURIComponent(title)}`
        );

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(error.response?.status || 500).json({
            message: "Error retrieving books by title",
            error: error.message
        });
    }
});



module.exports.general = public_users;

