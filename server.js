const app = require("./app");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KAY);
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
};

DBConnect();

app.listen(port, () => {
  console.log("server is running in ", port || 5000);
});

app.get("/", (req, res) => {
  res.send({
    message: "speedXpress server is running ",
  });
});

// collections
const usersCollection = client.db("speed-xpress").collection("users");
const parcelsCollection = client.db("speed-xpress").collection("parcels");
const customerCollection = client.db("speed-xpress").collection("customers");
const shopsCollection = client.db("speed-xpress").collection("shops");

// ------------------------ALL PUT OPERATION _________________________________

// Save user email & generate JWT
app.put("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = req.body;

    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: user,
    };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

// ------------------------ALL PUT OPERATION _________________________________

//delivery status update
app.patch("/update-status", async (req, res) => {
  try {
    const { parcelId, updatedStatus } = req.body;
    console.log(parcelId)
    const filter = { _id: new ObjectId(parcelId) };
    // const options = { upsert: true };
    const updateDoc = { $set: { status: updatedStatus } };

    const result = await parcelsCollection.updateOne(
      filter,
      updateDoc,

    );
    if (result.modifiedCount === 1) {
      res.status(200).send({
        success: true,
        message: "Status updated successfully",
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Failed to update status",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      message: `Operation failed`,
    });
  }
});

// update shop data for merchant
app.patch("/update-shop", async (req, res) => {
  try {
    const { shopId, updatedData } = req.body;
    console.log(shopId, updatedData);

    const filter = { _id: new ObjectId(shopId) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        shopName: updatedData.shopName,
        fullName: updatedData.ownerName,
        shopNumber: updatedData.shopNumber,
        shopAddress: updatedData.shopAddress,
      },
    };

    const result = await shopsCollection.updateOne(filter, updateDoc, options);
    if (result.modifiedCount === 1) {
      res.status(200).send({
        success: true,
        message: "Status updated successfully",
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Failed to update status",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      message: `Operation failed`,
    });
  }
});
//

//

// ------------------------ALL PUT OPERATION _________________________________

// merchant shop delete
app.delete("/delete-shop", async (req, res) => {
  try {
    const { shopId } = req.body;
    const filter = { _id: new ObjectId(shopId) };
    const result = await shopsCollection.deleteOne(filter);
    if (result.modifiedCount === 1) {
      res.status(200).send({
        success: true,
        message: "shop deleted successfully",
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Failed to delete shop",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      message: `Operation failed`,
    });
  }
});

//

//

// ------------------------ALL GET OPERATION _________________________________

// generate jwt token
app.get("/jwt", (req, res) => {
  try {
    const { email } = req.query;
    console.log("jwt", email);

    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    if (token) {
      console.log(token);
      res.send({ token });
    } else {
      res.send({ message: "Failed to get token from server" });
    }
  } catch (error) {
    console.log(error);
  }
});

// get a single user by email

app.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("get user", email);
    const query = {
      email: email,
    };
    const result = await usersCollection.findOne(query);
    if (result?.account_type) {
      console.log(result?.account_type);
      res.send({
        data: result?.account_type,
        message: `user founded and account type is ${result?.account_type}`,
      });
    } else res.status(200).send({ data: null, message: "no account found" });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/userData/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const query = {
      email: email,
    };
    const result = await usersCollection.findOne(query);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

// get all customers
app.get("/customers/:email", async (req, res) => {
  try {
    const merchantEmail = req.params.email;
    console.log("merchant Email", merchantEmail);

    const result = await customerCollection
      .find({ merchantEmail: merchantEmail })
      .toArray();
    if (result.length) {
      res.status(200).send({
        success: true,
        data: result,
      });
    } else {
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
      message: `Operation failed`,
    });
  }
});

app.get("/parcels", async (req, res) => {
  try {
    const senderEmail = req.query.email;
    console.log("Shop Email", senderEmail);

    const result = await parcelsCollection
      .find({ senderEmail: senderEmail })
      .toArray();
    if (result.length) {
      res.status(200).send({
        success: true,
        data: result,
      });
    } else {
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
      message: `Operation failed`,
    });
  }
});

// get all parcel for admin account
app.get("/all-parcels", async (req, res) => {
  try {
    const result = await parcelsCollection.find({}).toArray();
    if (result.length) {
      res.status(200).send({
        success: true,
        data: result,
      });
    } else {
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
      message: `Operation failed`,
    });
  }
});

// get all merchant

app.get("/getUser/:userType", async (req, res) => {
  const userType = req.params.userType;
  try {
    const query = { account_type: userType };
    const result = await usersCollection.find(query).toArray();
    if (result.length) {
      res.status(200).send({
        success: true,
        data: result,
        message: "oparation success",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "no data found ",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: `oparation failed`,
      data: null,
    });
  }
});

// get merchant shops
app.get("/shop", async (req, res) => {
  console.log(req.query.email);
  try {
    const shopOwnerEmail = req.query.email;
    const result = await shopsCollection
      .find({ shopEmail: shopOwnerEmail })
      .toArray();
    if (result.length) {
      res.status(200).send({
        success: true,
        message: `successfully found`,
        data: result,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `No shop found`,
        data: [],
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      success: false,
      data: null,
      message: `Operation failed`,
    });
  }
});

//

//get parcel for delivery boy/ employee filterd by district
app.get("/parcels/:district", async (req, res) => {
  try {
    const { district } = req.params;
    const { status } = req.query;
    console.log({ district, status });

    const query = { "customerInfo.district": district };

    if (status) {
      query.status = status;
    }
    console.log(query)
    const result = await parcelsCollection.find(query).toArray();
    console.log(result);
    res.send(result);

  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      message: "error failed to fetch",
    });
  }
});


//

// ------------------------ALL POST OPERATION _________________________________

// create parcel .
app.post("/parcel", async (req, res) => {
  try {
    const customerData = req.body;
    const result = await parcelsCollection.insertOne(customerData);

    if (result.acknowledged) {
      res.send({
        message: "parcel creation successfull ",
        data: result,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "Booking failed! for some issue!",
      data: null,
    });
  }
});

// save customer info

// create merchant shop .
app.post("/create-shop", async (req, res) => {
  try {
    const shopData = req.body;
    const result = await shopsCollection.insertOne(shopData);

    if (result.acknowledged) {
      res.send({
        message: "shop creation successfull ",
        data: result,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "Shop Booking failed! for some issue!",
      data: null,
    });
  }
});

app.put("/customer/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const customer = req.body;

    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: customer,
    };
    // if customer exist then replace him and if don't exisst then create new customer ..
    const result = await customerCollection.updateOne(
      filter,
      updateDoc,
      options
    );

    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

// payment
// --------------validation for stripe payyment
const stripeChargeCallback = (res) => (stripeErr, stripeRes) => {
  if (stripeErr) {
    console.log(stripeErr);
    res.status(500).send({ error: stripeErr });
  } else {
    // console.log(stripeRes)
    res.status(200).send({ success: stripeRes });
  }
};

app.post("/payment", async (req, res) => {
  try {
    const { parcelId, token } = req.body;
    // console.log(parcelId)
    // get  that parcel price from  backend
    const specificParcel = await parcelsCollection.findOne({
      _id: new ObjectId(parcelId),
    });
    // console.log(specificParcel)
    // create a charge for it
    const charge = {
      source: token.id,
      amount: specificParcel.TotalchargeAmount * 100,
      currency: "usd",
      // customer: customer.id,
      receipt_email: specificParcel.email,
      description: `The amount paid by ${specificParcel.name}`,
      // billing_details: token.card,
    };
    // console.log(charge)

    // send according response
    stripe.charges.create(charge, stripeChargeCallback(res));

    // update paid status in parcl collection
    const updateResult = await parcelsCollection.updateOne(
      { _id: new ObjectId(parcelId) },
      { $set: { paid: true } }
    );
    console.log(updateResult);
  } catch (error) {
    console.error("Payment Error: ", error);
    res.status(500).send({ error: "Payment Error" });
  }
});

// const updateResult = await homesCollection.updateOne({ _id: ObjectId(homeID) }, { $set: { booked: true } });

// ------------------------ALL Post OPERATION _________________________________
