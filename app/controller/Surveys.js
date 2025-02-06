import { countQuestions, countUsersConnectedSurveys, countUsersResponses, createOption, createQuestion, createSurvey, createSurveyResponses, deleteSurvey, deleteSurveyResponses, FetchSurveyQuestionById, FetchSurveyQuestions, FetchSurveyQuestionsDisplay, FetchSurveyQuestionsToDisplay, FetchSurveyQuestionsWeb, findAllTheSurveyResponses, GetAllSurveyByUserType, getQuestionDetails, getSurvey, getSurveyById, getSurveyResponse, updateOption, updateQuestion, updateStatus, updateStatusQuestion, updateSurvey, updateSurveyResponse } from "../model/Surveys.js";
import { applySearchAndPagination, sendErrorResponse, sendSuccessResponse } from "../utility/common.js";
import { Op } from "sequelize";


//MobAuth
export const FetchQuestions = async (req, res) => {
  var survey_code = req.query.survey_code;
  if (survey_code) {
    try {
      const result = await FetchSurveyQuestions(survey_code);

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

//WEB DISPLAY QUESTIONS
export const FetchQuestionsDisplay = async (req, res) => {
  const survey_code = req.query.survey_code;

  if (!survey_code) {
    return sendErrorResponse(res, 404, "Invalid arguments.", []);
  }
  const conditions = {
    searchTerm: req.query.searchTerm || "",
    page: parseInt(req.query.page) || 1,
    pageSize: parseInt(req.query.pageSize) || 10,
    searchFields: ["question_label"],
  };

  try {
    await FetchSurveyQuestionsDisplay(survey_code, conditions, res);
  } catch (error) {
    return sendErrorResponse(res, "Error fetching survey questions");
  }
};

//WEB ADD SURVEY
export const GetAllSurvey = async (req, res) =>{
    const user_id = req.userId;
    const user_type = req.user_type;
    const Ids = await GetAllSurveyByUserType(user_id,user_type);

    const options = {
      attributes: ["survey_code", "survey_name", "user_id"],
    };
    if (Ids) {
      options.where = { user_id: { [Op.in]: Ids } };
    }
    const result = await getSurveyById(options);
    if (result.code) {
      sendSuccessResponse(res, 'Successfully fetched', result.res)
    } else {
       return sendErrorResponse(res, 'No surveys found.');
    }
}

const generateSurveyCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const AddSurvey = async (req, res) => {
    const survey_name  = req.body.survey_name;
    const surveyDesc  = req.body.surveyDesc;
    const survey_code = generateSurveyCode();
    const user_id = req.userId;
    const newSurvey = createSurvey({ survey_name, survey_code, user_id,surveyDesc });
    sendSuccessResponse(res, 'Survey created successfully', newSurvey)
};

export const UpdateSurveyName = async (req, res) => {
    const survey_code = req.body.survey_code; 
    const survey_name  = req.body.survey_name;
    const affectedRows = await updateSurvey({survey_name}, survey_code);
    if (affectedRows?.code) {
      sendSuccessResponse(res,`Updated ${affectedRows.res} record(s)`);
    } else {
      sendErrorResponse(res,'Survey not found');
    }
};

export const DeleteSurveyName = async (req, res) => {
    const survey_code= req.query.survey_code;
    const result=  await deleteSurvey(survey_code);
    if(result){
      sendSuccessResponse(res,'Survey deleted successfully', result);
    }else {
      sendErrorResponse(res,'Survey not deleted');
    }
};

export const SaveSurveyQuestion = async (req, res) => {
  const {
    survey_code,
    question_type,
    question_label,
    placeholder,
    is_required,
    scale,
    min,
    max,
    step,
    options,
  } = req.body;

    const newQuestion = await createQuestion({
      survey_code,
      question_type,
      question_label,
      placeholder,
      is_required,
      scale,
      min,
      max,
      step,
    });
    if (!newQuestion?.res?.dataValues?.question_id) {
      sendErrorResponse(res,'questions not created');
    }

    const response = { newQuestion };

    if (["DROPDOWN", "SINGLE_SELECTION", "MULTISELECT"].includes(question_type)) {
      const optionsData = options.map(({label,index }) => ({
        survey_code: newQuestion.res.dataValues.survey_code,
        survey_question_id: newQuestion.res.dataValues.question_id,
        option_label: label,
      }));

      const createdOptions = await createOption(optionsData);
      response.createdOptions = createdOptions;
    }
    sendSuccessResponse(res, 'Survey created successfully', response)
};

export const UpdateOptionStatus = async (req,res) =>{
  const id = req.body.id;
  const affectedRows = await updateStatus({status:"0"},id)

  if (affectedRows?.code) {
    sendSuccessResponse(res,`Updated ${affectedRows.res} record(s)`);
  } else {
    sendErrorResponse(res,'Survey not found');
  }

}

export const UpdateQuestionStatus = async (req,res) =>{
  const question_id = req.body.question_id;
  const affectedRows = await updateStatusQuestion({status:"0"},question_id)

  if (affectedRows?.code) {
    sendSuccessResponse(res,`Updated ${affectedRows.res} record(s)`);
  } else {
    sendErrorResponse(res,'Survey not found');
  }

}

export const FetchQuestionById = async (req, res) => {
  var question_id = req.query.question_id;
  if (question_id) {
    try {
      const result = await FetchSurveyQuestionById(question_id);
      if (result.code) {
        sendSuccessResponse(res, 'Successfully fetched', result.res)
      } else {
         return sendErrorResponse(res, 'No surveys found.');
      }
    } catch (error) {
      return sendErrorResponse(res, 404, 'Error', []);
    }
  }
   else
   return sendErrorResponse(res, 404, "Invalid arguments.", []);
};

export const FetchQuestionsWeb = async (req, res) => {
  try {
    const conditions = {
      searchTerm: req.query.searchTerm,
      page: parseInt(req.query.page),
      pageSize: parseInt(req.query.pageSize),
      searchFields: ["survey_name"],
    };
    const user_id = req.userId;
    const user_type = req.user_type;
    const Ids = await GetAllSurveyByUserType(user_id,user_type);

    const options = {
      attributes: ["survey_code", "survey_name", "user_id","surveyDesc"],
      order: [["survey_name", "DESC"]],
    };

    if (Ids) {
      options.where = { user_id: { [Op.in]: Ids } };
    }

    const queryOptions = applySearchAndPagination(conditions, options);

    const surveyResponse = await getSurvey(queryOptions);

    if (!surveyResponse.code || !surveyResponse.res.rows.length) {
      return sendErrorResponse(res, "No surveys found.");
    }

    const surveys = surveyResponse.res;

    const surveyDetails = [];

    for (const survey of surveys.rows) {
      const { survey_code, survey_name, user_id } = survey;

      try {
        const result = await FetchSurveyQuestionsWeb(survey_code);

        if (result.code) {
          surveyDetails.push({
            survey_code,
            survey_name,
            user_id,
            questions: result.res,
          });
        } else {
          surveyDetails.push({
            survey_code,
            survey_name,
            user_id,
            error: `Error fetching questions: ${result.res}`,
          });
        }
      } catch (error) {
        surveyDetails.push({
          survey_code,
          survey_name,
          user_id,
          error: `Error fetching questions: ${error.message}`,
        });
      }
    }

    const totalPages = Math.ceil(surveys.count / conditions.pageSize);

    sendSuccessResponse(res, "Successfully fetched survey details", {
      surveys: surveyDetails,
      pagination: {
        totalItems: surveys.count,
        totalPages,
        currentPage: conditions.page,
        pageSize: conditions.pageSize,
      },
    });
  } catch (error) {
    sendErrorResponse(res, "Failed to fetch survey details");
  }
};

export const UpdateSurveyQuestion = async (req, res) => {
  const { id, question, question_type, placeholder, scale, min, max, step, is_required, options, survey_code } = req.body;

  try {
    let surveyQuestion;
    if (id) {
      surveyQuestion = await updateQuestion({question_label:question, question_type, placeholder, scale, min, max, step, is_required: is_required },id) 
    } 

    const newOptions = [];

    if (["DROPDOWN", "SINGLE_SELECTION", "MULTISELECT"].includes(question_type)) {
      for (let option of options) {
        if (option.id) {
            await updateOption({ text: option.text }, option.id);
        } else {
          newOptions.push({
            survey_question_id: id || surveyQuestion.id,
            survey_code: survey_code,
            option_label: option.text,
          });
        }
      }
      if (newOptions.length > 0) {
        await createOption(newOptions);
      }
    }

    sendSuccessResponse(res,`Updated survey Questions record(s)`);
  } catch (error) {
    sendErrorResponse(res,'Survey not found');
  }
};

export const getSurveyStatistics = async (req, res) => {
  const survey_code = req.query.survey_code;

  if (!survey_code) {
    return sendErrorResponse(res, 400, "Survey code is required.");
  }

  try {
    const connectedSurveyCount = await countUsersConnectedSurveys(survey_code);

    const questionCount = await countQuestions(survey_code)

    const uniqueUserCount = await countUsersResponses(survey_code);

    sendSuccessResponse(res, "Survey statistics fetched successfully", {
      connectedSurveyCount,
      questionCount,
      uniqueUserCount: uniqueUserCount, 
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Failed to fetch survey statistics");
  }
};

export const getAllCountByResponses = async(req,res) =>{
  const survey_code = req.query.survey_code;
  if (!survey_code) {
    return sendErrorResponse(res, 400, "Survey code is required.");
  }
  try{
    const questionsResult = await FetchSurveyQuestionsToDisplay(survey_code);
    if (!questionsResult.code) {
      return sendErrorResponse(res, 404, questionsResult.res);
    }

    const questionsLabel = questionsResult.res;

    const result = await Promise.all(
      questionsLabel.map(async (question) => {
        const questionId = question.dataValues.id;
        const responses = await findAllTheSurveyResponses(survey_code,questionId);

        const optionsWithCounts = responses.code
        ? responses.res.map((response) => ({
            response:  response.dataValues.responses,
            userCount: parseInt(response.dataValues.userCount),
          }))
        : [];

        return {
            question_id: questionId,
            question_label: question.dataValues.label,
            options: question.dataValues.options || [],
            responses: optionsWithCounts,
        };
      })
    );
    
    sendSuccessResponse(res, "responses count fetched successfully",result);

  } catch(error){
    sendErrorResponse(res, 500, "Failed to fetch count by Responses");
  }
}

export const saveSurveyResponses = async (req, res) => {
  const user_id = req.userId;
  const { survey_code, question_id, answer, question_type } = req.body;

  try {
    const question = await getQuestionDetails({ survey_code, question_id });

    if (!question) {
      throw new Error(`Question with ID ${question_id} and Survey Code ${survey_code} not found.`);
    }

    let fileUrl = null;
    if (req.file) {
      let folder = 'images'; 

      if (/mp4|mov|avi/.test(req.file.mimetype)) {
        folder = 'videos';
      } else if (/mp3|wav/.test(req.file.mimetype)) {
        folder = 'audio';
      }

      fileUrl = `assets/${folder}/${req.file.filename}`;
    }
    const { is_required } =  question.res.dataValues;
    if (is_required === 1) {
      if (!answer && !fileUrl) {
        throw new Error('This question is required. A response must be provided.');
      }
    }
    
    if (['IMAGE_INPUT', 'VIDEO_INPUT', 'AUDIO_INPUT', 'SIGNATURE_INPUT'].includes(question_type)) {
      if (!req.file) {
        throw new Error(`File is required for ${question_type}.`);
      }
      fileUrl = `assets/images/${req.file.filename}`;
    }
  

    if (question_type === 'MULTISELECT') {
      if (!Array.isArray(answer)) {
        throw new Error('Answer for MULTISELECT must be an array.');
      }

      const responsePromises = answer.map(async (option) => {
        await createSurveyResponses({
          survey_code,
          question_id,
          user_id,
          responses: option,
        });
      });
      await Promise.all(responsePromises);

      sendSuccessResponse(res, 'Responses saved successfully!', '');
      return;
    }

    let formattedResponse;

    switch (question_type) {
      case 'INPUT':
        formattedResponse = answer;
        break;

      case 'DECIMAL':
        if (typeof answer !== 'number' || !Number.isFinite(answer) || Number.isInteger(answer)) {
          throw new Error('Answer for DECIMAL must be a decimal number.');
        }
        formattedResponse = answer;
        break;

      case 'WHOLE_NUMBER':
      case 'SINGLE_SELECTION':
      case 'DROPDOWN':
        if (!Number.isInteger(answer)) {
          throw new Error(`Answer for ${question_type} must be an integer.`);
        }
        formattedResponse = answer;
        break;

      case 'TRUE_FALSE':
        if (typeof answer !== 'boolean') {
          throw new Error('Answer for TRUE_FALSE must be a boolean (true/false).');
        }
        formattedResponse = answer;
        break;

      case 'IMAGE_INPUT':
      case 'VIDEO_INPUT':
      case 'AUDIO_INPUT':
      case 'SIGNATURE_INPUT':
        if (!fileUrl) {
          throw new Error(`File URL is required for ${question_type}.`);
        }
        formattedResponse = fileUrl;
        break;

      default:
        throw new Error(`Unsupported question type: ${question_type}`);
    }
    const result = await createSurveyResponses({
      survey_code,
      question_id,
      user_id,
      responses: formattedResponse,
    });

    if (!result.code) {
      throw new Error(result.res);
    }

    sendSuccessResponse(res, 'Responses saved successfully!', '');
  } catch (error) {
    sendErrorResponse(res, 'Error saving responses');
  }
};

export const updateSurveyResponses = async (req, res) => {
  const user_id = req.userId;
  const { survey_code, question_id, answer, question_type, id } = req.body;

  try {
    const question = await getQuestionDetails({ survey_code, question_id });

    if (!question) {
      throw new Error(`Question with ID ${question_id} and Survey Code ${survey_code} not found.`);
    }

    let fileUrl = null;
    let folder = 'images'; 
    if (req.file) {
      if (/mp4|mov|avi/.test(req.file.mimetype)) {
        folder = 'videos';
      } else if (/mp3|wav/.test(req.file.mimetype)) {
        folder = 'audio';
      }

      fileUrl = `assets/${folder}/${req.file.filename}`;
    }

    const { is_required } = question.res.dataValues;
    if (is_required === 1) {
      if ((answer === undefined || answer === null) && !fileUrl) {
        throw new Error('This question is required. A response must be provided.');
    }
    }
    
    if (['IMAGE_INPUT', 'VIDEO_INPUT', 'AUDIO_INPUT', 'SIGNATURE_INPUT'].includes(question_type)) {
      if (!req.file) {
        throw new Error(`File is required for ${question_type}.`);
      }
      fileUrl = `assets/${folder}/${req.file.filename}`; 
    }
  
    const existingResponse = id 
      ? await getSurveyResponse({ survey_code, question_id, user_id, id }) 
      : null;

      if (question_type === 'MULTISELECT') {
        if (!Array.isArray(answer)) {
          throw new Error('Answer for MULTISELECT must be an array.');
        }

        const deleteResult = await deleteSurveyResponses({ survey_code, question_id, user_id });
        if (!deleteResult.code) {
          throw new Error('Failed to delete existing MULTISELECT responses.');
        }
  
        const responsePromises = answer.map(async (option) => {
          await createSurveyResponses({
            survey_code,
            question_id,
            user_id,
            responses: option,
          });
        });
        await Promise.all(responsePromises);
  
        sendSuccessResponse(res, 'Responses saved successfully!', '');
        return;
      }
  
    let formattedResponse;
    switch (question_type) {
      case 'INPUT':
        formattedResponse = answer;
        break;

      case 'DECIMAL':
        if (typeof answer !== 'number' || !Number.isFinite(answer) || Number.isInteger(answer)) {
          throw new Error('Answer for DECIMAL must be a decimal number.');
        }
        formattedResponse = answer;
        break;

      case 'WHOLE_NUMBER':
      case 'SINGLE_SELECTION':
      case 'DROPDOWN':
        if (!Number.isInteger(answer)) {
          throw new Error(`Answer for ${question_type} must be an integer.`);
        }
        formattedResponse = answer;
        break;

      case 'TRUE_FALSE':
        if (typeof answer !== 'boolean') {
          throw new Error('Answer for TRUE_FALSE must be a boolean (true/false).');
        }
        formattedResponse = answer;
        break;

      case 'IMAGE_INPUT':
      case 'VIDEO_INPUT':
      case 'AUDIO_INPUT':
      case 'SIGNATURE_INPUT':
        if (!fileUrl) {
          throw new Error(`File URL is required for ${question_type}.`);
        }
        formattedResponse = fileUrl;
        break;

      default:
        throw new Error(`Unsupported question type: ${question_type}`);
    }

    if (existingResponse?.code) {
      const updateResult = await updateSurveyResponse({
        survey_code,
        question_id,
        user_id,
        responses: formattedResponse,
        response_id: id,
      });

      if (!updateResult.code) {
        throw new Error(updateResult.res);
      }

      sendSuccessResponse(res, 'Response updated successfully!', '');
    } else {
      sendErrorResponse(res, 'No response found to update, and insertion is not allowed.');
    }
  } catch (error) {
    sendErrorResponse(res, `Error handling response: ${error.message}`);
  }
};

