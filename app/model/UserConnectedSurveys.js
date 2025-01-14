import { UserConnectedSurveys } from "./tables.js";

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
