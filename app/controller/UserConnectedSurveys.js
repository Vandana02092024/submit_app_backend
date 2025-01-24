import { getUserConnectedSurveys, updateUserConnected } from "../model/UserConnectedSurveys.js";
import { sendErrorResponse, sendSuccessResponse } from "../utility/common.js";

export const UpdateUserConnectedSurveys = async (req, res) => {
    const uLocation = {};
    const user_id = req.userId;
   const survey_code = req.body.survey_code; 
    uLocation.status = req.body.status; 
    uLocation.completed_date = req.body.completed_date; 
    
    const affectedRows = await updateUserConnected(uLocation, survey_code,user_id);
    if (affectedRows?.code) {
      sendSuccessResponse(res,`Updated ${affectedRows.res} record(s)`);
    } else {
      sendErrorResponse(res,'Survey not found');
    }
};

export const FetchUserConnectedSurveys = async (req, res) => {
  var survey_code = req.query.survey_code;
  var user_id = req.userId;
  if (survey_code) {
    try {
      const result = await getUserConnectedSurveys(survey_code,user_id);
      if (result.code) {
        res.status(200).json({ message: "success", data: result.res });
      } else {
         res .status(400) .json({ message: `Error Message: ${result.res}`, data: [] });
      }
    } catch (error) {
      res.status(400).json({ message: "Error: " + error, data: [] });
    }
  }
   else
    res.status(400).json({ message: "Invalid arguments.", data: [] });
};