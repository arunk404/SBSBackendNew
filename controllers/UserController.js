// controllers/userController.js
const db = require("../models/ApplyRelation");
const RoleModel = db.RoleModel;
const UserModel = db.UserModel;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { getAllUserDTO, UserRoleDTO} = require('../dtos/user.dto');


const generateToken = (id, roleTitle, email) => {
  return jwt.sign({ userId: id, role: roleTitle, email: email }, process.env.SECRETKEY, { expiresIn: '24h' });
};

const findByEmail = (email) => {
  return UserModel.findOne({ where: { PK_EMAIL: email} , include: RoleModel });
};

const validatePassword = (password,hashpassword) => {
  return bcrypt.compare(password, hashpassword);
};

const createUser = async (req, res, next) => {

  const { fname, lname, email, password, roleId, is_active} = req.body;
  let userEmail = email.toLowerCase();
  const user = req.user;    // req.user;
  // Validate input using the imported validateRoles array
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  }

  const user1 = await findByEmail(userEmail);
  if (user1) {
    return res.status(409).json({code: 409, status:'Error', message: 'Email already Registered' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
      const newUser = await UserModel.create({
        NAME_FIRST: fname,
        NAME_LAST: lname,
        PK_EMAIL: userEmail,
        PASSWORD: hashedPassword,
        roleId: roleId,
        is_active: is_active,
        createdBy: user.ID,
      });
      res.status(201).json({code: 201, status:'Successful', message: 'User has been created successfully' });
  } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};

// Add a hook to automatically populate the role_title field before creating a new user
UserModel.addHook('beforeCreate', async (user, options) => {
  try {
    // Fetch the corresponding role based on roleId
    const role = await RoleModel.findByPk(user.roleId);

    // If the role exists, populate the role_title field
    if (role) {
      user.role_title = role.title;
    }
  } catch (error) {
    console.error('Error populating role_title:', error);
    throw error; // Rethrow the error to prevent the user creation
  }
});

async function getUsers(req, res) {
  try {
    const data = await UserModel.findAndCountAll();

    const recordList = data.rows.map(newdata => new getAllUserDTO(newdata));
    var totalCount = 0;
    var tableName = "Users List";
    if(data.rows.length>0){
      totalCount = data.count;
    }
    res.status(200).json({
      code: 200, status: 'Successful', message: 'Record extracted successfully',
      NumberOfRecords: totalCount, tableName:tableName, records: recordList
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
}

const getUserByIdOrCurrentUser = async (req, res, next) => {
  let { id } = req.params;
  console.log(id);
  const user = req.user;    // req.user;
  try {
    if (id == "" || id === undefined) {
      id = user.ID;
    }
    const data = await UserModel.findByPk(id);
    if (!data) {
      return res.status(404).json({code: 404, status:'Error', message: 'User not found'});
    }

    const recordList = new getAllUserDTO(data.dataValues);
    res.status(200).json({
      code: 200, status: 'Successful', message: 'Record extracted successfully',
      records: recordList
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error' });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  let { fname, lname, email, password = "", roleId, is_active} = req.body;
  email = email.toLowerCase();
  if (id == "" || id === undefined) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "User Nr is required" });
  }
  try {
    const user1 = await UserModel.findByPk(id);
    if (!user1) {
      return res.status(404).json({code: 404, status:'Error', message: 'User not found'  });
    }
    user1.NAME_FIRST = fname;
    user1.NAME_LAST = lname;
    // user1.PK_EMAIL = email;
    user1.roleId = roleId;
    user1.is_active = is_active;
    if(password != ""){
      const hashedPassword = await bcrypt.hash(password, 10);
      user1.PASSWORD = hashedPassword;
    }
    // Fetch the corresponding role based on the new roleId
    const role = await RoleModel.findByPk(roleId);
    // If the role exists, update the role_title field
    if (role) {
      user1.role_title = role.title;
    }
    await user1.save();
    res.json(user1);
  } catch (error) {
    // console.error(error);
    res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error'  });
  }
}

async function updateProfile(req, res) {
  const user = req.user;
  const { fname, lname, password = ""} = req.body;
  try {
    const user1 = await UserModel.findByPk(user.ID);
    if (!user1) {
      return res.status(404).json({code: 404, status:'Error', message: 'User not found'  });
    }
    user1.NAME_FIRST = fname;
    user1.NAME_LAST = lname;
    if(password != ""){
      const hashedPassword = await bcrypt.hash(password, 10);
      user1.PASSWORD = hashedPassword;
    }
    await user1.save();
    res.json(user1);
  } catch (error) {
    res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error'  });
  }
}

// Returns: login page
async function getLoginView(req, res) {
  try {
    if (req.session.loggedin) {
        // already logged in.
        res.status(204).send("continue");
    } else {
      res.render('login', {layout: '/layouts/index'}); //returning login page
    }
  } catch (error) {
      res.status(500).json({code:500, status:'Error', message: 'Internal Server Error' });
  }
};

async function login (req, res) {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    const user = await findByEmail(email);
    if (!user || !(await validatePassword(password,user.PASSWORD))) {
      return res.status(401).json({code: 401, status:'Error', message: 'Authentication failed' });
    }
    if (user.is_active == 0) {
      return res.status(401).json({ code: 401, status: 'Error', message: 'User is not active' });
    }
    const token = generateToken(user.ID, user.role.title, user.PK_EMAIL);
    res.status(200).json({code: 200, status:'Successful', message: 'Login successful', token: token, role: user.role.slug});
  } 
  catch (error) {
    res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};

async function logout (req, res) {
  try{
    res.clearCookie('token');
  }catch(error){
    // console.log(error); //FIXIT:Temporary solution because logout was not working in frontend
  }
  res.status(200).json({ status:'Successful', message: 'Logout successful' });
};

async function getUsersByType(req, res) {
    const { id = ''} = req.query;  //Get Id
    try{
      if (id == "") {
        return res.status(400).json({code: 400, status: 'Validation Error', message: "User Type is required" });
      }
      
      const data = await UserModel.findAndCountAll({ 
        where: { roleId: id },
        order: [
            ['NAME_FIRST', 'ASC'],  // ASC for ascending order, DESC for descending order
        ],
      });
    
      const recordList = data.rows.map(newdata => new getAllUserDTO(newdata));
      var totalCount = 0;
      var tableName = "Users List";
      if(data.rows.length>0){
        totalCount = data.count;
      }
      res.status(200).json({
        code: 200, status: 'Successful', message: 'Record extracted successfully',
        NumberOfRecords: totalCount, tableName:tableName, records: recordList
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
}

async function getRoles(req, res) {
  try{
    const data = await RoleModel.findAndCountAll({
      order: [
          ['title', 'ASC'],  // ASC for ascending order, DESC for descending order
      ],
    });
  
    const recordList = data.rows.map(newdata => new UserRoleDTO(newdata));
    var totalCount = 0;
    var tableName = "Roles List";
    if(data.rows.length>0){
      totalCount = data.count;
    }
    res.status(200).json({
      code: 200, status: 'Successful', message: 'Record extracted successfully',
      NumberOfRecords: totalCount, tableName:tableName, records: recordList
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
}

const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "User Nr is required" });
  }
  try {
    const current_user = await UserModel.findByPk(id);
    if (!current_user) {
      return res.status(404).json({code: 404, status:'Error', message: 'Bauelement not found'  });
    }
    current_user.deletedBy = user.ID;
    const current_userData  = await current_user.destroy();
    res.status(201).json({code: 201, status:'Successful', message: 'User deleted successfully' });
    } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};

module.exports = {
  createUser,
  updateUser,
  updateProfile,
  getUsers,
  getUserByIdOrCurrentUser,
  login,
  logout,
  getLoginView,
  getUsersByType,
  getRoles,
  deleteUser,
};
