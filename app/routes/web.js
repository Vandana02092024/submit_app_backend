import { Router } from "express";
import { AddSurvey, FetchQuestions } from "../controller/Surveys.js";

const route = Router();

route.get("/fetch-questions", FetchQuestions);
route.post("/addSurvey",AddSurvey)

export default route;