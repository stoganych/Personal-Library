/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

module.exports = function (app) {

  const express = require('express');
  const mongoose = require('mongoose');
  const { Schema } = mongoose;
  const bodyParser = require('body-parser');

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  mongoose.connect(process.env.MONGO_URI);

  const BookSchema = new Schema({
    title: { type: String, required: true },
    comments: { type: [String], default: [] },
    commentcount: { type: Number, default: 0 },
  })

  const BookModel = mongoose.model("Book", BookSchema);

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      BookModel.find({})
        .then((data) => res.json(data))
    })

    .post(function (req, res) {
      const title = req.body.title;
      BookModel.create({
        title
      })
        .then((data) => res.json(data))
        .catch(() => res.send("missing required field title"))
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      BookModel.deleteMany({})
        .then(() => res.send("complete delete successful"))
        .catch((err) => console.log(err))
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      const bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      BookModel.find({ _id: bookid })
        .then((book) => {
          if (!book.length) {
            return res.send("no book exists");
          }
          res.json(...book)
        })
        .catch((err) => console.log(err))
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (comment === "" || comment == null) {
        return res.send("missing required field comment")
      }
      BookModel.findByIdAndUpdate({ _id: bookid },
        {
          $push: { comments: comment },
          $inc: { commentcount: 1 }
        },
        { new: true })
        .then((book) => {
          if (book == null) {
            return res.send("no book exists")
          }
          res.json(book)
        })
        .catch((err) => console.log(err))
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      BookModel.findByIdAndDelete({ _id: bookid })
        .then((data) => {
          if (data == null) {
            return  res.send("no book exists")
          }
          res.send("delete successful")})
        .catch((err) => console.log(err))
    });

};
