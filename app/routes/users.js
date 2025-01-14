import { Router } from "express";
import { AddUser, DeleteUserDetails, FetchUserDetails, UpdateUserDetails } from "../controller/Users.js";

var route = Router();

// CREATE NEW USER //
route.post("/addUser", AddUser);
route.get("/fetchUserDetails",FetchUserDetails);
route.put("/updateUserDetails",UpdateUserDetails);
route.delete("/deleteUserDetails",DeleteUserDetails)

export default route;