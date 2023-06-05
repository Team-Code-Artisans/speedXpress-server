const app = require("./app");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 8080;
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n84h1t4.mongodb.net/?retryWrites=true&w=majority`;
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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("speed-xpress").command({ ping: 1 });
    console.log("database connected successfully");
    app.listen(port, () => {
      console.log(`speed-xpress server listening on port ${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch((err) => console.log(err));
