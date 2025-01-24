import { Router } from "express";
import { FetchUserConnectedSurveys, UpdateUserConnectedSurveys } from "../controller/UserConnectedSurveys.js";

const route = Router();

route.put("/UpdateUserConnectedSurveys",UpdateUserConnectedSurveys);
route.get("/FetchUserConnectedSurveys", FetchUserConnectedSurveys);

export default route;
