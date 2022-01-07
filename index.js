const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

//
//Database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vamyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("connected to database");
    const database = client.db("blog");

    const collectionUser = database.collection("users");
    const blogCollection = database.collection("blog");
    const collectionComments = database.collection("comments");

    /* ==================== CRUD Method start ====================== */

    //collection a new user when register
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await collectionUser.insertOne(user);
      res.json(result);
    });

    //store user when login or google login
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const UserDoc = {
        $set: user,
      };
      const result = await collectionUser.updateOne(filter, UserDoc, options);
      res.json(result);
    });

    // Get a single user
    app.get("/users/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const userInfo = await collectionUser.findOne(query);
      res.send(userInfo);
    });

    //post a new comments
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      const result = await collectionComments.insertOne(comment);
      res.json(result);
    });

    // get all comments 
    app.get('/comments', async (req, res) => {
      const result = await collectionComments.find({}).toArray();
      res.send(result);
  });

    //add blog
    app.post("/blog", async (req, res) => {
      console.log(req.body);
      const name = req.body.name;
      const email = req.body.email;
      const category = req.body.category;
      const title = req.body.title;
      const description = req.body.description;
      const date = req.body.date;
      const time = req.body.time;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");

      const post = {
        name,
        email,
        category,
        title,
        description,
        date,
        time,
        image: imageBuffer,
      };
      const result = await blogCollection.insertOne(post);
      res.json(result);
    });

    //get blog
    app.get("/blog", async (req, res) => {
      const cursor = blogCollection.find({});
      console.log("hit api");
      const order = await cursor.toArray();
      res.send(order);
    });

    //find a single blog using id
    app.get('/blogDetails/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await blogCollection.findOne(filter);
      res.send(result);
  });

    //delete
    app.delete("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    //await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running Blog server");
});

app.listen(port, () => {
  console.log("running blog server on port", port);
});
