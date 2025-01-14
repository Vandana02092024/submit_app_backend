import { Router } from "express";
import { Register, LogIn, AppChangePin, LogInWeb } from "../controller/Auth.js";

var route = Router();

// REGISTER NEW USER //
route.post("/sign-up", Register);

route.post("/sign-up-web", Register);

//LOGIN//
route.post("/login", LogIn);


// LOGIN WEB//
route.post("/loginWeb", LogInWeb);

//CHANGE PASSWORD
route.post("/change-pin",AppChangePin);

export default route;
