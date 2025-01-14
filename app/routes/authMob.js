import { Router } from "express";
import { AppChangePin, AppLogin, AppSignUp } from "../controller/Auth.js";

var route = Router();

// SIGNUP NEW USER //
route.post("/sign-up", AppSignUp);

// LOGIN //
route.post("/login", AppLogin);

// CHANGE PASSWORD //
route.post("/change-pin", AppChangePin);

export default route;
