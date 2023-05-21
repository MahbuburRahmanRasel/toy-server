const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
//env
require("dotenv").config();

//middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h8icusb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const toysCollection = client.db("toysDB").collection("toys");
    const addtoysCollection = client.db("toysDB").collection("addtoys");
    const indexKeys = { toyname: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "toyCategory" }; // Replace index_name with the desired index name
    const result = await addtoysCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    //get all Toys (toysCollection)
    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get single toy (toysCollection)
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    //get categoprical data (toysCollection)
    app.get("/toys/:sub_category", async (req, res) => {
      const result = await toysCollection
        .find({
          sub_category: req.params.sub_category,
        })
        .toArray();
      res.send(result);
    });

    app.post("/addtoys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await addtoysCollection.insertOne(newToy);
      res.send(result);
    });

    //get my toys
    app.get("/mytoys/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await addtoysCollection
        .find({
          email: req.params.email,
        })
        .sort({ price: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/mytoys", async (req, res) => {
      const result = await addtoysCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addtoysCollection.findOne(query);
      res.send(result);
    });

    //serach 
    app.get("/getToysByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await addtoysCollection
        .find({
          $or: [
            { toyname: { $regex: text, $options: "i" } }
            
          ],
        })
        .toArray();
      res.send(result);
    });



    //delete a toy
    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addtoysCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/addtoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addtoysCollection.findOne(query);
      res.send(result);
    });

    // update data
    app.put("/addtoys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;

      const toy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          details: updatedToy.details,
        },
      };

      const result = await addtoysCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy is running ");
});

app.listen(port, () => {
  console.log(`Toy is runnig :${port}`);
});
