import bcrypt from "bcrypt";
import User, {
  findUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  getUsers,
} from "../model/Users.js";
import dotenv from "dotenv";
import { Op } from "sequelize"; 
import { applySearchAndPagination, sendErrorResponse, sendSuccessResponse } from "../utility/common.js";
import { GetAllSurveyByUserType } from "../model/Surveys.js";

dotenv.config();
const salt = bcrypt.genSaltSync(10);

export const AddUser = async (req, res) => {
    const select = ["name", "email","username","usertype"];
    const parent_id = req.userId;
    const usertype = req.body.usertype;
    const where = [{ email: req.body.email,username: req.body.username,
      name: req.body.name ,usertype: req.body.usertype,parent_id:parent_id}];

    const exUser = await findUserByUsername(select, where);
    if (exUser.code) 
      sendSuccessResponse(res, 'data found', exUser)
    else {
      let password = req.body.password;
      let conf_password = req.body.conf_password;
      var npassword = bcrypt.hashSync(password, salt);
      const newUser = req.body;
      newUser.password = npassword;
      newUser.parent_id = parent_id;
      newUser.user_type = usertype;
      const user = await createUser(newUser);
      sendSuccessResponse(res, 'User created successfully', user)
    }
};

export const FetchUserDetails = async (req, res) => {
    try {
      const conditions = {
        searchTerm: req.query.searchTerm,
        searchFields: ["name", "email", "username"],
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 10,
      };
      const user_id = req.userId;
      const user_type = req.user_type;
      const Ids = await GetAllSurveyByUserType(user_id,user_type);
  
      const options = {
        attributes: ["name", "username", "email","user_type","id","status"],
        order: [["username", "DESC"]],
      };

      if (Ids) {
        options.where = { id: { [Op.in]: Ids } };
      }

      const queryOptions = applySearchAndPagination(conditions, options);
      const users = await getUsers(queryOptions);
      if (!users.code || !users.res.rows.length) {
        return sendErrorResponse(res, "No user found.");
      }
      const totalPages = Math.ceil(users.res.count / conditions.pageSize);
      sendSuccessResponse(res, "Successfully fetched user details", {
        users,
        pagination: {
          totalItems: users.count,
          totalPages,
          currentPage: conditions.page,
          pageSize: conditions.pageSize,
        },
      });
    } catch (error) {
      console.error("Error fetching users details:", error);
      sendErrorResponse(res, "Failed to fetch users details");
    }
};

export const UpdateUserDetails = async (req, res) => {
    const { id, ...fieldsToUpdate } = req.body;

    if (!id) {
        return sendErrorResponse(res, "User ID is required.");
    }
    if (fieldsToUpdate.password) {
        const salt = bcrypt.genSaltSync(10);
        fieldsToUpdate.password = bcrypt.hashSync(fieldsToUpdate.password, salt);
    }
    const affectedRows = await updateUser(fieldsToUpdate, id);

    if (affectedRows?.code) {
        sendSuccessResponse(res, `Updated ${affectedRows.res} record(s).`);
    } else {
        sendErrorResponse(res, affectedRows.res || "User not found.");
    }
};

export const DeleteUserDetails = async (req, res) => {
  const id= req.query.id;
  const result=  await deleteUser(id);
  if(result){
    sendSuccessResponse(res,'Survey deleted successfully', result);
  }else {
    sendErrorResponse(res,'Survey not deleted');
  }
};

export const changePassword = async (req, res) => {
  const {currentPassword, newPassword, confirmNewPassword } = req.body;
  const user_id = req.userId;
  const select = ["name", "email","username","usertype"];
  const where = { user_id:user_id};

  if(!currentPassword || !newPassword || !confirmNewPassword){
    return sendErrorResponse(res, 'Please fill the credentials');
  }
  try {
    const exUser = await findUserByUsername(select, where);
      const passwordMatch = await bcrypt.compare(currentPassword, exUser.password);
      if (!passwordMatch) {
        return sendErrorResponse(res, 'Current Password is incorrect.');
      }
      if (newPassword !== confirmNewPassword) {
        return sendErrorResponse(res, 'New password and confirm new password do not match.');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await updateUser({password: hashedPassword},user_id);
      sendSuccessResponse(res,"Password changed successfully.");
  } catch (error) {
      console.error('Error changing password:', error);
      return sendErrorResponse(res, 'An error occurred while changing the password.');
  }
};
  