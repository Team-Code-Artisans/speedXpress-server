

module.exports.getUsers = (req, res) => {



  res.status(200).send({
    success: true,
    massage: "Success",
    data: { userId: 1, password: "12345" },
  });
};


// add users to db
module.exports.addUsersTODb = async (req, res) => {
  
    try {
      const email = req.params.email
      const user = req.body

      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options)

      // const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      //     expiresIn: '1d',
      // })
      // console.log(result, token)
      res.send(result)
    } catch (error) {
      console.log(error.message)
    }
  


};
