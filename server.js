const app = require("./app");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken")

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n84h1t4.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const DBConnect = async () => {
  try {
    await client.connect();
    console.log("success connection to db");
  } catch (error) {
    console.log(error.message);
  }
}

DBConnect();



app.listen(port, () => {
  console.log("server is running in ", port || 5000);
})


app.get("/", (req, res) => {
  res.send({
    message: "speedXpress server is running "
  })
})



// collections
const usersCollection = client.db('speed-xpress').collection('users');
const parcelsCollection = client.db('speed-xpress').collection('parcels');
const customerCollection = client.db('speed-xpress').collection('customers');


// ------------------------ALL PUT OPERATION _________________________________

// Save user email & generate JWT
app.put('/user/:email', async (req, res) => {
  try {
    const email = req.params.email
    const user = req.body

    const filter = { email: email }
    const options = { upsert: true }
    const updateDoc = {
      $set: user,
    }
    const result = await usersCollection.updateOne(filter, updateDoc, options)
    res.send(result)
  } catch (error) {
    console.log(error.message)
  }
})


// ------------------------ALL PUT OPERATION _________________________________

// 
// 

// 

// ------------------------ALL GET OPERATION _________________________________

// generate jwt token
app.get("/jwt", (req, res) => {
  try {
    const { email } = req.query;
    console.log("jwt", email);

    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    })
    if (token) {
      console.log(token)
      res.send({ token })
    }
    else {
      res.send({ message: "Failed to get token from server" })
    }

  } catch (error) {
    console.log(error)

  }

})


// get a single user by email

app.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("get user", email)
    const query = {
      email: email
    }
    const result = await usersCollection.findOne(query);
    res.send(result)
  } catch (error) {
    console.log(error.message)
  }
})



// get all customers
app.get('/customers/:email', async (req, res) => {
  try {
    const customerOwnerEmail = req.params.email
    console.log("owner email", customerOwnerEmail)

    const result = await customerCollection.find({ customerOwnerEmail: customerOwnerEmail }).toArray();
    if (result.length) {
      res.status(200).send({
        success: true,
        data: result
      });
    }
    else {
      res.status(200).send({
        success: false,
        message: `No cumtomer found`,
        data: [],
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      success: false,
      data: null,
      message: `Operation failed`
    });
  }
})

app.get('/parcels', async (req, res) => {
  try {
    const senderEmail = req.query.email
    console.log("Shop Email", senderEmail)

    const result = await parcelsCollection.find({ senderEmail: senderEmail }).toArray();
    if (result.length) {
      res.status(200).send({
        success: true,
        data: result
      });
    }
    else {
      res.status(200).send({
        success: false,
        message: `No Parcels found`,
        data: [],
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      success: false,
      data: null,
      message: `Operation failed`
    });
  }
})

// ------------------------ALL GET OPERATION _________________________________

// 

// 

// 


// 


// ------------------------ALL POST OPERATION _________________________________

// create parcel .
app.post("/parcel", async (req, res) => {

  try {
    const customerData = req.body;
    const result = await parcelsCollection.insertOne(customerData)

    if (result.acknowledged) {
      res.send({
        message: "parcel creation successfull ",
        data: result
      });

    }
  } catch (error) {
    console.log(error.message)
    res.status(404).send({
      message: "Booking failed! for some issue!",
      data: null
    });
  }
})


// save customer info



app.put('/customer/:email', async (req, res) => {
  try {

    const email = req.params.email
    const customer = req.body

    const filter = { email: email }
    const options = { upsert: true }
    const updateDoc = {
      $set: customer,
    }
    // if customer exist then replace him and if don't exisst then create new customer ..
    const result = await customerCollection.updateOne(filter, updateDoc, options);

    console.log(result)
    res.send(result)
  } catch (error) {
    console.log(error.message)
  }
})












// ------------------------ALL Post OPERATION _________________________________
