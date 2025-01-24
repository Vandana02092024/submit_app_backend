import { Surveys, UserConnectedSurveys } from "./tables.js";

// ## CRAETE A NEW RECORD //
export const addConnectedSurvey = async (insert) => {
  return await UserConnectedSurveys.create(insert);
};

// ## GET LATEST CONNECTED SURVEY //
export const getLatestSurveyConnected = async (user_id) => {
  const res = await UserConnectedSurveys.findOne({
    where: {
      user_id: user_id,
    },
    order: [["created_at", "DESC"]],
  });

  if (!res) return { code: false, res: "Can't find connected survey" };
  else return { code: true, res: res };
};

export const updateUserConnected = async (uLocation,survey_code,user_id) => {
  try {
    const res = await UserConnectedSurveys.update(uLocation, 
      { where: { survey_code: survey_code,
        user_id:user_id} });
    if (!res)
      return {
        code: false,
        res: "There is some issue while updating the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: error.message };
  }
};

export const getUserConnectedSurveys = async (survey_code,user_id) => {
  try {
    const res = await UserConnectedSurveys.findOne({
      attributes: ["completed_date"],
      where: {
        survey_code: survey_code,
        user_id:user_id
      },
      include: {
        model: Surveys,
        attributes: [["survey_name", "name"], ["surveyDesc", "description"]]
      }
    });
    if (!res)
      return { code: false, res: "Survey does not exist in our system." };
    else return { code: true, res: res };
  } catch (err) {
    return { code: false, res: err.message };
  }
};