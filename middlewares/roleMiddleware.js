const db = require("../models/ApplyRelation");
const RoleModel = db.RoleModel;
const UserModel = db.UserModel;
const UserRoleDTO = require("../dtos/user.dto");

async function getRoles(id){
    return await RoleModel.findByPk(id , {attributes: ['slug'],});
};

const roleMiddleware = (requiredRoles) => {
    return async (req, res, next) => {
      const user = req.user;
      // console.log(user);
      if (!user) {
        return res.status(401).json({code: 401, status:'Error', message: 'User not found' });
      }
      const userRoles = await getRoles(user.roleId);
      // console.log(userRoles);
      const roleNames = userRoles.slug;
      const hasRequiredRole = requiredRoles.some(role => roleNames.includes(role));
      console.log("Role: "+hasRequiredRole+" - "+roleNames);
      if (!hasRequiredRole) {
        return res.status(403).json({code: 403, status:'Error',message: 'Unauthorized' });
      }
      req.userrole = roleNames; // Attach the user object to the request
      next();
    };
  };
  
  module.exports = { roleMiddleware }; 