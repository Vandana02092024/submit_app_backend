import { applySearchAndPagination, sendErrorResponse, sendSuccessResponse } from "../utility/common.js";
import { SurveyQuestionOptions, SurveyQuestions, SurveyResponses, Surveys, User, UserConnectedSurveys } from "./tables.js";
import { Op } from "sequelize";

import {Sequelize} from 'sequelize';

export const FetchSurveyQuestions = async (survey_code) => {
  try {
    const res = await SurveyQuestions.findAll({
      attributes: [
        ["question_id", "id"],
        ["question_type", "type"],
        ["question_label", "label"],
        "placeholder",
        "is_required",
        "scale",
        "min",
        "max",
        "step",
      ],
      where: {
        survey_code: survey_code,
      },
      include: {
        model: SurveyQuestionOptions,
        as: "options",
        attributes: [
          ["option_value", "id"],
          ["option_label", "text"],
        ],
      },
      order: [["question_id", "ASC"]],
    });

    if (!res)
      return { code: false, res: "Survey does not exist in our system." };
    else return { code: true, res: res };
  } catch (err) {
    return { code: false, res: err.message };
  }
};

export const FetchSurveyQuestionsToDisplay = async (survey_code) => {
  try {
    const res = await SurveyQuestions.findAll({
      attributes: [
        ["question_id", "id"],
        ["question_type", "type"],
        ["question_label", "label"],
        "placeholder",
        "is_required",
        "scale",
        "min",
        "max",
        "step",
      ],
      where: {
        survey_code: survey_code,
      },
      include: {
        model: SurveyQuestionOptions,
        as: "options",
        attributes: [
          ["id", "id"],
          ["option_label", "text"],
        ],
      },
      order: [["question_id", "ASC"]],
    });

    if (!res)
      return { code: false, res: "Survey does not exist in our system." };
    else return { code: true, res: res };
  } catch (err) {
    return { code: false, res: err.message };
  }
};

export const FetchSurveyQuestionsDisplay = async (survey_code, conditions, res) => {
  try {
    const baseOptions = {
      attributes: [
        ["question_id", "id"],
        ["question_type", "type"],
        ["question_label", "label"],
        "placeholder",
        "is_required",
        "scale",
        "min",
        "max",
        "step",
      ],
      where: {
        survey_code: survey_code,
        status: "1",
      },
      order: [["question_id", "ASC"]],
      include: {
        model: SurveyQuestionOptions,
        as: "options",
        attributes: [
          ["id", "id"],
          ["option_label", "text"],
        ],
        required: false,
        where: { status: "1" },
      },
    };
    const countOptions = applySearchAndPagination(conditions, {
      ...baseOptions,
      attributes: undefined,
      include: undefined, 
    });

    const totalCount = await SurveyQuestions.count({
      where: countOptions.where,
    });

    const queryOptions = applySearchAndPagination(conditions, baseOptions);

    const surveys = await SurveyQuestions.findAll(queryOptions);

    const totalPages = Math.ceil(totalCount / conditions.pageSize);

    sendSuccessResponse(res, "Successfully fetched survey details", {
      surveys: surveys,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: conditions.page,
        pageSize: conditions.pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching survey details:", error);
    sendErrorResponse(res, "Failed to fetch survey details");
  }
};

export const FetchSurveyQuestionsWeb = async (survey_code) => {
  try {
    const res = await SurveyQuestions.findAll({
      attributes: [
        ["question_id", "id"],
        ["question_type", "type"],
        ["question_label", "label"],
      ],
      where: { survey_code: survey_code },
      order: [["question_id", "ASC"]],
    });

    if (!res)
      return { code: false, res: "Survey does not exist in our system." };
    else return { code: true, res: res };
  } catch (err) {
    return { code: false, res: err.message };
  }
};

export const createSurvey = async(insert) =>{
  try {
    const res = await Surveys.create(insert);
    if (!res)
      return {
        code: false,
        res: "There is some issue while adding the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
}

export const getSurvey = async(condition) =>{
  try {
    const res = await Surveys.findAndCountAll(condition);
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

export const updateSurvey = async(updateDt, id) =>{
  try {
    const res = await Surveys.update(updateDt, { where: { survey_code: id } });
    if (!res)
      return {
        code: false,
        res: "There is some issue while updating the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
}

export const deleteSurvey = async(id) =>{
  try {
    const res = await Surveys.destroy({ where: { survey_code: id } });
    if (!res)
      return {
        code: false,
        res: "There is some issue while deleting the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
}

export const createQuestion = async(insert) =>{
  try {
    const res = await SurveyQuestions.create(insert);
    if (!res)
      return {
        code: false,
        res: "There is some issue while adding the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: error.message };
  }
}

export const createOption = async (insert) => {
  try {
    const res = await SurveyQuestionOptions.bulkCreate(insert);
    if (!res || res.length === 0) {
      return {
        code: false,
        res: "There is some issue while adding the records.",
      };
    }
    return { code: true, res: res };
  } catch (error) {
    console.error("Error in createOption:", error);
    return { code: false, res: error.message };
  }
};

export const updateOption = async (updateDt, id) => {
  try {
    const res = await SurveyQuestionOptions.update(updateDt, { where: { id: id } });
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

export const updateQuestion = async (updateDt, id) => {
  try {
    const res = await SurveyQuestions.update(updateDt, { where: { question_id: id } });
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

export const updateStatus = async (status, id) => {
  try {
    const res = await SurveyQuestionOptions.update(status, { where: { id: id } });
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

export const updateStatusQuestion = async (status, question_id) => {

  try {
    const res = await SurveyQuestions.update(status, { where: { question_id: question_id }});
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

export const FetchSurveyQuestionById = async (question_id) => {
  try {
    const res = await SurveyQuestions.findOne({
      attributes: [
        ["question_id", "id"],
        ["question_type", "type"],
        ["question_label", "label"],
        "placeholder",
        "is_required",
        "scale",
        "min",
        "max",
        "step",
      ],
      where: { question_id: question_id },
      include: {
        model: SurveyQuestionOptions,
        as: "options",
        attributes: [
          ["id", "id"],
          ["option_label", "text"],
        ],
        required: false, 
        where: { status: "1" }
      },
      order: [["question_id", "ASC"]],
    });

    if (!res)
      return { code: false, res: "Survey does not exist in our system." };
    else return { code: true, res: res };
  } catch (err) {
    return { code: false, res: err.message };
  }
};

export const GetAllSurveyByUserType = async(user_id,user_type) =>{
  let userIds = [];
  if (user_type === "superadmin") {
    userIds = null;
  } else if (user_type === "admin") {
    const childUsers = await User.findAll({
      attributes: ["id"],
      where: {
        [Op.or]: [
          { id:user_id }, 
          { parent_id: user_id },
        ],
      },
    });
    userIds = childUsers.map((child) => child.id);
  } else if(user_type === "user"){
    const Users = await User.findAll({
      attributes:["id"],
      where:{id:user_id}
    })
    userIds = Users.map((user) => user.id);
    // userIds = [Users]
  }
  else {
    return sendErrorResponse(res, "Unauthorized user type.");
  }
  return userIds;
}

export const getSurveyById = async(conditions) =>{
  try {
    const res = await Surveys.findAll(conditions);
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

export const createSurveyResponses= async(insert) =>{
  try {
    const res = await SurveyResponses.create(insert);
    if (!res)
      return {
        code: false,
        res: "There is some issue while adding the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
}

export const countQuestions = async(survey_code) =>{
  try {
    const res = await SurveyQuestions.count({
      where:{survey_code:survey_code,
        status: "1"
      }
    });
    if (!res)
      return {
        code: false,
        res: "There is some issue while adding the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
}

export const countUsersResponses= async(survey_code) =>{
  try {
    const res = await SurveyResponses.count({
      where:{survey_code:survey_code},
      group: ["user_id"],
    });
    if (!res)
      return {
        code: false,
        res: "There is some issue while adding the record.",
      };
    else return { code: true, res: res.length };
  } catch (error) {
    return { code: false, res: err.message };
  }
}

export const countUsersConnectedSurveys = async(survey_code) =>{
  try {
    const res = await UserConnectedSurveys.count({
      where:{survey_code:survey_code}
    });
    if (!res)
      return {
        code: false,
        res: "There is some issue while adding the record.",
      };
    else return { code: true, res: res };
  } catch (error) {
    return { code: false, res: err.message };
  }
}

export const findAllTheSurveyResponses = async(survey_code,questionId) =>{
  try{
    const res = await SurveyResponses.findAll({
      where: { survey_code:survey_code, question_id: questionId },
      attributes: [
        "responses", 
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "userCount"],
      ],
      group: ["responses"]
    });

    if (!res || res.length === 0) {
      return { code: false, res: [] }; 
    }
    else return { code: true, res: res };

  }catch(error) {
    return { code: false, res: error.message };
  }
}


export const getQuestionDetails = async ({ survey_code, question_id }) => {
  console.log("survey_code, question_id",survey_code, question_id)
  try {
    const res =  await SurveyQuestions.findOne({
      where: { survey_code, question_id },
      attributes: ['is_required'],
    });
    if(!res)
      return {
        code: false,
        res: "There is some issue while adding the record.",
      } ;
      else return { code: true, res: res };
  } catch (error) {
    console.error('Error fetching question details:', error.message);
    throw new Error('Error fetching question details');
  }
};

export const getSurveyResponse = async ({ survey_code, question_id, user_id, id }) => {
  try {
    const res = await SurveyResponses.findOne({
      where: { survey_code, question_id, user_id, response_id: id },
    });

    if (!res) {
      return {
        code: false,
        res: "There is some issue while finding the survey response.",
      };
    }
    return { code: true, res };
  } catch (error) {
    return { code: false, res: error.message };
  }
};

export const updateSurveyResponse = async (update) => {
  try {
    const { survey_code, question_id, user_id, responses, response_id } = update;

    const res = await SurveyResponses.update(
      { responses },
      { where: { survey_code, question_id, user_id, response_id: response_id } }
    );

    if (!res[0]) {
      return {
        code: false,
        res: "There is some issue while updating the record.",
      };
    }
    return { code: true, res };
  } catch (error) {
    return { code: false, res: error.message };
  }
};

export const deleteSurveyResponses = async ({ survey_code, question_id, user_id }) => {
  try {
    const result = await SurveyResponses.destroy({
      where: { survey_code, question_id, user_id },
    });
    return { code: true, res: result };
  } catch (error) {
    return { code: false, res: error.message };
  }
};

