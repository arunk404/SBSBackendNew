class UserDTO {
    constructor(id, username, email) {
      this.id = id;
      this.NAME_FIRST = username;
      this.PK_EMAIL = email;
      this.NAME_LAST = email;
      this.PASSWORD = email;
    }
  }

  class UserRoleDTO {
    constructor(params) {
      this.id = params.id;
      this.title = params.title;
    }
  }
  
  class getAllUserDTO {
    constructor(params) {
      
      this.id = params.ID;
      this.employeename = params.NAME_FIRST + " " + params.NAME_LAST;
      this.email = params.PK_EMAIL;
      this.is_active = params.is_active;
      this.roleId = params.roleId;
      this.role_title = params.role_title
    }
  }


module.exports = {UserDTO , UserRoleDTO, getAllUserDTO};