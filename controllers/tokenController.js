// generate jwt token
const jwt=require("jsonwebtoken")

module.exports.sendToken=async(req,res)=>{
    try {
        const { email } = req.query;
        console.log(email);

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
}