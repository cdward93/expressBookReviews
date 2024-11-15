const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username) => {
  // Check if any user with the same username exists in the users array
  return users.some((user) => user.username === username);
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password

    if (!isValid(username)) return false;
    
    const authenticated = users.some((user) => user.username === username && user.password === password);

    if (authenticated) return true;
    else return false;
    
}


//only registered users can login
// Login endpoint
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in.  Username or password missing." });
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
        return res.status(200).send(`Customer successfully logged in - username ${username}`);
    } else {
        return res.status(208).json({ message: `Invalid Login. Check username and password: username: ${username}, password: ${password}` });
    }
});


// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  let bookFound;

  for (const key in books) { // Iterate through the books array
    if (key === isbn.toString()) { // Check if we've found the desired ISBN
      bookFound = true; // Mark it as found

      if (!books[key].reviews || !Object.keys(books[key].reviews).length > 0) {
        books[isbn].reviews = { username: req.body.username, review: req.body.review };
      } else {
        const currentReviews = Object.values(books[key].reviews);
        for (let i = 0; i < currentReviews.length; i++) {
          if (!currentReviews[i]) continue;
          console.log(`Review found. Replacing with new one.`);
          books[isbn].reviews = { username: req.body.username, review: req.body.review };
        }
      }

      return res.status(200).json({ message: `Review added successfully for ISBN ${isbn}` });
    }
  }

  if (!bookFound) {
    console.log(`Book not found - isbn ${isbn}`);
    return res.json({ message: 'Book not found' });
  }
});






regd_users.delete("/auth/delete/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.body.username;

  let bookFound = false;

  for (const key in books) { // Iterate through the books array
    if (key === isbn.toString()) { // Check if we've found the desired ISBN
      bookFound = true; // Mark it as found

      if (!books[key].reviews || !Object.keys(books[key].reviews).length > 0) {
        console.log(`No reviews for this book.`);
      } else {
        let newReviews = { ...books[isbn].reviews }; // Create a shallow clone of the reviews object
        const reviewUsernames = Object.keys(newReviews); // Get an array of usernames

        for (const username of reviewUsernames) { // Iterate over each review username
          if (username === req.body.username) {
            delete newReviews[username]; // Delete the review with that username
            break; // stop searching once we find the correct review
          }
        }

        books[isbn].reviews = newReviews; // Update the original reviews object

        console.log(`Review deleted successfully!`);
      }
    }
  }

  if (!bookFound) {
    console.log("Book not found.");
  }

  res.send({ message: `Delete successful for ISBN ${isbn} by USER ${username}` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
