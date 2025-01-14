import { Router } from "express";
import { AddSurvey, DeleteSurveyName, FetchQuestionById, FetchQuestions, FetchQuestionsDisplay, FetchQuestionsWeb, getAllCountByResponses, GetAllSurvey, getSurveyStatistics, SaveSurveyQuestion, saveSurveyResponses, UpdateOptionStatus, UpdateQuestionStatus, UpdateSurveyName, UpdateSurveyQuestion } from "../controller/Surveys.js";

const route = Router();

route.get("/fetch-questions", FetchQuestions);

route.post("/addSurvey", AddSurvey);
route.get("/getAllSurvey",GetAllSurvey);
route.get("/fetchQuestionsWeb",FetchQuestionsWeb);
route.put("/updateSurveyName",UpdateSurveyName);
route.delete("/deleteSurveyName",DeleteSurveyName);
route.get("/getAllSurvey",GetAllSurvey);
route.post("/saveSurveyQuestion",SaveSurveyQuestion);
route.get("/fetch-questions-display",FetchQuestionsDisplay);
route.get("/fetchQuestionById",FetchQuestionById);
route.put("/updateOptionStatus",UpdateOptionStatus);
route.put("/updateSurveyQuestion",UpdateSurveyQuestion);
route.put("/updateQuestionStatus",UpdateQuestionStatus);
route.get("/getSurveyStatistics",getSurveyStatistics);
route.get("/getAllCountByResponses",getAllCountByResponses);
route.post("/saveSurveyResponses",saveSurveyResponses)

export default route;