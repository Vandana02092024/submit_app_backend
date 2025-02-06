import { User } from "./tables.js";
import { Op } from "sequelize";

// ## FIND USER BY USERNAME ONLY //
export const findUserByUsername = async (select, where) => {
  try {
    const res = await User.findOne({
      attributes: select,
      where: where,
    });

    if (!res) return { code: false, res: "User is not registered with us." };
    else return { code: true, res: res };
  } catch (err) {
    return { code: false, res: err.message };
  }
};

// ## SEARCH USER BY LOGIN CREDENTAILS //
export const loginUser = async (select, credentials) => {
  try {
    const res = await User.findOne({
      attributes: select,
      where: credentials, // { [Op.and]: credentials, },
    });
    if (!res) return { code: false, res: "Username or Password is incorrect." };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: error.message };
  }
};

// ## CRAETE A NEW USER //
export const createUser = async (insert) => {
  return await User.create(insert);
};

// ## UPDATE EXISTING USER //
export const updateUser = async (updateDt, id) => {
  try {
    const res = await User.update(updateDt, { where: { id: id } });
    if (!res)
      return {
        code: false,
        res: "There is some issue while updating the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
};

export const deleteUser = async ( id) => {
  try {
    const res = await User.update({ where: { id: id } });
    if (!res)
      return {
        code: false,
        res: "There is some issue while deleting the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
};

//FIND ALL USER
export const getUsers = async(condition) =>{
  try {
    const res = await User.findAndCountAll(condition);
    if (!res)
      return {
        code: false,
        res: "There is some issue while finding the surveys.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: error.message };
  }
}

// ## DEFAULT EXPORT
export default User;
