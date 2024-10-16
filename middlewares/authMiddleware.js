const jwt = require('jsonwebtoken');
const db = require("../models/ApplyRelation");
const RoleModel = db.RoleModel;
const UserModel = db.UserModel;

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({code: 401, status:'Error', message: 'Token missing' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.SECRETKEY);
    const user = await UserModel.findByPk(decodedToken.userId);
    if (!user) {
      return res.status(401).json({code: 401, status:'Error', message: 'User not found' });
    }
    req.user = user; // Attach the user object to the request
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({code: 401, status:'Error', message: 'Token invalid' });
  }
};

module.exports = { authenticateUser };