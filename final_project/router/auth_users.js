const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username) => {
    return users.some((user) => user.username === username);
};



const authenticatedUser = (username, password) => {
    return users.some((user) =>
        user.username === username &&
        user.password === password
    );
};


//only registered users can login

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign(
            { username: username },
            "access",
            { expiresIn: "1h" }
        );

        req.session.authorization = {
            accessToken: accessToken,
            username: username
        };

        return res.status(200).json({
            message: "User successfully logged in"
        });
    }

    return res.status(401).json({
        message: "Invalid username or password"
    });
});

// Add a book review

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (typeof review !== "string" || !review.trim()) {
        return res.status(400).json({
            message: "Review cannot be empty"
        });
    }

    const alreadyReviewed =
        Object.prototype.hasOwnProperty.call(
            books[isbn].reviews,
            username
        );

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: alreadyReviewed
            ? "Review updated successfully"
            : "Review added successfully",
        reviews: books[isbn].reviews
    });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!Object.prototype.hasOwnProperty.call(
        books[isbn].reviews,
        username
    )) {
        return res.status(404).json({
            message: "No review found for this user"
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
