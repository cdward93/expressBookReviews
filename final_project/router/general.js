const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username is already taken
    const found = users.some((user) => user.username === username);    

    if (!found) {
    // Add the new user to the users object
        users.push({"username":username, "password":password});
        return res.status(200).json({ message: "Customer registered successfully" });
    }
    else return res.status(409).json({ message: "Username already taken" });
  })

// Get the book list available in the shop
public_users.get("/",(req,res)=>{
    res.send(JSON.stringify(books,null,4));
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) res.json(book);
    else res.status(404).json({message: "Book not found"});

   });
    
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
    
    if (filteredBooks.length > 0) res.json(filteredBooks);
    else res.status(404).json({ message: "No books found for this author" });
    
  });

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter(book => 
      book.title.toLowerCase().includes(title)
    );
    
    if (filteredBooks.length > 0) res.json(filteredBooks);
    else res.status(404).json({ message: "No books found with this title" });
    
  });
  
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
      if (book.reviews) res.json({ isbn: isbn, reviews: book.reviews });
      else res.json({ isbn: isbn, message: "No reviews found for this book" });
    } 
    else res.status(404).json({ message: "Book not found" });
    
  });
  
module.exports.general = public_users;
