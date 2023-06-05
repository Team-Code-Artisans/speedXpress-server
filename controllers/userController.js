module.exports.getUsers = (req, res) => {
  res.status(200).send({
    success: true,
    massage: "Success",
    data: { userId: 1, password: "12345" },
  });
};
