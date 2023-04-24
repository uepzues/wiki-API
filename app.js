import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

//set mongodb connection
mongoose.set("strictQuery", false);
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("dist"));
app.use(express.urlencoded({ extended: true }));

//set view engine as ejs
app.set("view engine", "ejs");

//create schema
const articleSchema = {
  title: String,
  content: String,
};
const Article = mongoose.model("Article", articleSchema);

app.get("/", (req, res) => {
  Article.find().then((foundArticles) => {
    res.render("home", { foundArticles: foundArticles });
  });
});

//all articles ################################

app
  .route("/articles")
  .get((req, res) => {
    Article.find()
      .then((foundArticles) => {
        res.send(foundArticles);
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    });
    newArticle
      .save()
      .then(() => {
        res.send("Added new article");
      })
      .catch((err) => {
        res.send(err);
      });
  })
  .delete((req, res) => {
    Article.deleteMany()
      .then(() => {
        res.send("deleted all");
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

//selected articles #########################

app
  .route("/articles/:articleTitle")
  .get((req, res) => {
    Article.findOne({ title: req.params.articleTitle })
      .then((doc) => {
        if (doc) {
          res.send(doc);
          console.log(`Found ${doc.title}`);
        } else {
          res.send("none found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .put((req, res) => {
    Article.findOne({ title: req.params.articleTitle })
      .then((doc) => {
        if (!doc) {
          res.status(404).send("Title not found");
        } else {
          doc.overwrite({ title: req.body.title, content: req.body.content });
          doc.save();
          res.send("Document overwritten");
        }
      })
      .catch((err) => {
        res.status(500).send(err.message);
      });
  })
  .patch((req, res) => {
    Article.updateOne({ title: req.params.articleTitle }, { $set: req.body })
      .then((result) => {
        console.log(result);
        if (result.matchedCount === 0) {
          res.status(404).send("Article not found");
        } else {
          res.send("article patched");
          console.log("article patched");
        }
      })
      .catch((err) => {
        console.log("error caught", err);
        res.status(500).send(err.message);
      });
  })
  .delete((req, res) => {
    Article.deleteOne({ title: req.params.articleTitle })
      .then((doc) => {
        // console.log(req.params);
        // console.log(doc);
        if (doc.deletedCount === 0) {
          res.status(404).send("article not deleted");
          console.log("article not deleted");
        } else {
          res.send("article deleted");
          console.log("article deleted");
        }
      })
      .catch((err) => {
        console.log("error caught", err);
        res.status(500).send(err.message);
      });
  });

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server started on ${port}`);
  });
});
