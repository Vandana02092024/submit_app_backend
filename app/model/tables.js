import sequelize from "./db.js";
import { DataTypes } from "sequelize";

export const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id",
    },
    username: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    user_type: { type: DataTypes.STRING },
    email_verified_at: { type: DataTypes.DATE },
    password: { type: DataTypes.STRING },
    remember_token: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM("0", "1") },
    parent_id: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

export const UserConnectedSurveys = sequelize.define(
  "user_connected_surveys",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id",
    },
    user_id: { type: DataTypes.INTEGER },
    survey_code: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

export const Surveys = sequelize.define(
  "surveys",
  {
    survey_code: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
    },
    survey_name: { type: DataTypes.STRING },
    user_id: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

export const SurveyQuestions = sequelize.define(
  "survey_questions",
  {
    question_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    survey_code: { type: DataTypes.STRING },
    question_type: {
      type: DataTypes.ENUM,
      values: [
        "DROPDOWN",
        "INPUT",
        "SINGLE_SELECTION",
        "MULTISELECT",
        "IMAGE_INPUT",
        "AUDIO_INPUT",
        "VIDEO_INPUT",
        "SIGNATURE_INPUT",
        "TRUE_FALSE",
        "WHOLE_NUMBER",
        "DECIMAL",
        "RATING",
        "SLIDER",
      ],
    },
    question_label: { type: DataTypes.STRING },
    placeholder: { type: DataTypes.STRING },
    is_required: { type: DataTypes.TINYINT },
    scale: { type: DataTypes.FLOAT },
    min: { type: DataTypes.FLOAT },
    max: { type: DataTypes.FLOAT },
    step: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM("0", "1") },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

export const SurveyQuestionOptions = sequelize.define(
  "survey_question_options",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    survey_code: { type: DataTypes.STRING },
    survey_question_id: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM("0", "1") },
    option_label: { type: DataTypes.STRING },
    option_value: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

export const SurveyResponses = sequelize.define(
  "survey_responses",
  {
    response_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    survey_code: { type: DataTypes.STRING},
    question_id: { type: DataTypes.INTEGER},
    responses: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    user_id: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  },
  { timestamps: false }
);


// ASSOCIATIONS //

// Survey - Questions
Surveys.hasMany(SurveyQuestions, {
  foreignKey: {
    name: "survey_code",
  },
});
SurveyQuestions.belongsTo(Surveys, {
  foreignKey: {
    name: "survey_code",
  },
});

// Question - Options
SurveyQuestions.hasMany(SurveyQuestionOptions, {
  as: "options",
  foreignKey: {
    name: "survey_question_id",
  },
});
SurveyQuestionOptions.belongsTo(SurveyQuestions, {
  foreignKey: {
    name: "survey_question_id",
  },
});

// User (Admin) - Survey Create
User.hasMany(Surveys, {
  foreignKey: {
    name: "user_id",
  },
});
Surveys.belongsTo(User, {
  foreignKey: {
    name: "user_id",
  },
});

// User (Respondent) - Connected Surveys
User.hasMany(UserConnectedSurveys, {
  foreignKey: {
    name: "user_id",
  },
});
UserConnectedSurveys.belongsTo(User, {
  foreignKey: {
    name: "user_id",
  },
});
