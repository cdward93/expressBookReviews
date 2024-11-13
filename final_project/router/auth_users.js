const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username) => {  //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });

    // Return false (is NOT valid) if any user with the same username is found, otherwise ok
    if (userswithsamename.length > 0) return false;
    else return true;
    
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password

    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) return true;
    else return false;
    
}


//only registered users can login
// Login endpoint
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 180 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});


// Add a book review
regd_users.post("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.body.username;
  const { review } = req.body;

  // Check if the book exists in the books object
  if (!books.hasOwnProperty(isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add the review for the book
  books[isbn].reviews = { username: [review] };

  // Save the updated books object to the database or file
  // (This step is not included in the provided code snippet)

  return res.status(200).json({ message: "Review added successfully" });
});


// Replace a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.body.username;
  const { review } = req.body;

  // Check if the book exists in the books object
  if (!books.hasOwnProperty(isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Replace the review for the book
  books[isbn].reviews = { username: [review] };

  // Save the updated books object to the database or file
  // (This step is not included in the provided code snippet)

  return res.status(200).json({ message: "Review replaced successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Check if the book exists in the books object
  if (!books.hasOwnProperty(isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has a review
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No review found for this book" });
  }

  // Delete the review for the book
  delete books[isbn].reviews;


// search books - check author of review


  // Save the updated books object to the database or file
  // (This step is not included in the provided code snippet)

  return res.status(200).json({ message: "Review deleted successfully" });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
