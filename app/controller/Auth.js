import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Op } from "sequelize"; 
import {
  findUserByUsername,
  loginUser,
  createUser,
  updateUser,
} from "../model/Users.js";
import {
  addConnectedSurvey,
  getLatestSurveyConnected,
} from "../model/UserConnectedSurveys.js";
import { comparePasswords, generateRandomNumber, sendErrorResponse } from "../utility/common.js";
import { SendEmail } from "../utility/email.js";

dotenv.config();
const salt = bcrypt.genSaltSync(10);

// WEB
export const Register = async (req, res) => {
  try {
    const select = ["name", "email"];
    const where = [{ email: req.body.email,username: req.body.username }];

    const exUser = await findUserByUsername(select, where);
    if (exUser.code) res.status(200).json({ data: exUser });
    else {
      let password = req.body.password;
      let conf_password = req.body.conf_password;
      var npassword = bcrypt.hashSync(password, salt);
      console.log(salt);
      console.log(`NPassword: ${npassword}`);
      console.log(`password: ${password}`);
      const newUser = req.body;
      newUser.password = npassword;

      const user = await createUser(newUser);
      res.status(200).json({ data: user });
    }
  } catch (e) {
    console.log(e);
    res.status(401).json(e);
  }
};

export const LogIn = async (req, res) => {
  try {
    var password = req.body.password;
    var npassword = bcrypt.hashSync(password, salt);

    const select = ["id", "email", "name", "user_type"];
    const where = [{ username: req.body.username, password: npassword }];

    const exUser = await loginUser(select, where);

    if (exUser.code) {
      console.log(exUser.res);

      const existingUser = {
        user_id: exUser.res.dataValues.id,
        phone: exUser.res.dataValues.phone,
      };

      const token = jwt.sign(existingUser, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      console.log('token',token)

      const response = {
        token: token,
        user: {
          name: exUser.res.name,
          username: exUser.res.email,
          user_type: exUser.res.user_type,
        },
      };

      console.log('response',response);

      // sendResponse(res, "success", response);
      res.status(200).json({ data: response });
    } else {
      res.status(401).json({ message: exUser.res, data: [] }); //
    }
  } catch (err) {
    res.status(400).json({ message: "Error: " + err, data: [] });
  }
};

//FOR WEBLOGIN

export const LogInWeb = async (req, res) => {
  try {
    const input = req.body.username; 
    // const username= req.body.username;  
    const password  = req.body.password;  

    const select = ["id", "email", "name", "user_type", "password","status"]; 
    const where = { 
      [Op.or]: [{ username: input }, { email: input }],
      status: "1"
     }; 
    // const where = [{ username: username }]; 

    const exUser = await loginUser(select, where);

    if (exUser.res.status !== '1') {
      return res.status(403).json({ message: "User is inactive. Please contact support.", data: [] });
    }

    if (exUser.code) {
      const isPasswordValid = bcrypt.compareSync(password, exUser.res.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Username or Password is incorrect.", data: [] });
      }

      const existingUser = {
        user_id: exUser.res.dataValues.id,
        phone: exUser.res.dataValues.phone,
        user_type:exUser.res.dataValues.user_type
      };

      const token = jwt.sign(existingUser, process.env.SECRET_KEY, {
        expiresIn: "7h",
      });

      const response = {
        token: token,
        user: {
          name: exUser.res.name,
          username: exUser.res.email,
          user_type: exUser.res.user_type,
        },
      };

      return res.status(200).json({ data: response });
    } else {
      return res.status(401).json({ message: exUser.res, data: [] });
    }
  } catch (err) {
    return res.status(400).json({ message: "Error: " + err, data: [] });
  }
};

// MOB APP
export const AppSignUp = async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const pin = req.body.pin;
  const survey_code = req.body.survey_code;

  if (email && pin && survey_code && name) {
    try {
      const select = ["id", "email", "name", "user_type"];
      const where = [{ email: email }];

      var exUser = await findUserByUsername(select, where);
      var rsUser = {};
      
      console.log(exUser.res.id);
      if (!exUser.code) {
        let password = pin;

        var npassword = bcrypt.hashSync(password, salt);
        console.log(salt);
        console.log(`NPassword: ${npassword}`);
        console.log(`password: ${password}`);
        const newUser = {
          email: email,
          name: name,
          password: npassword,
          user_type: "respondent",
        };

        exUser = await createUser(newUser);
        var existingUser = {
          respondent_id: exUser.id,
          email: exUser.email,
        };

        // CONNECT SURVEY //
        const csi = {
          user_id: exUser.id,
          survey_code: survey_code,
        };
        await addConnectedSurvey(csi);

        rsUser = {
          name: exUser.name,
          email: exUser.email,
          user_type: exUser.user_type,
          survey_code: survey_code,
        };

        // DIRECT LOGIN FOR USER //
        const token = jwt.sign(existingUser, process.env.SECRET_KEY, {
          expiresIn: "7d", // "1h",
        });

        const response = {
          token: token,
          user: rsUser,
        };

        res.status(200).json({ message: "success", data: response });
      } else {
        var existingUser = {
          email: exUser.res.email,
        };

        res.status(200).json({
          message: "Your account already exists. Please proceed to login.",
          data: existingUser,
        });
      }
    } catch (e) {
      console.log(e);
      res.status(401).json(e);
    }
  } else res.status(400).json({ message: "Invalid arguments.", data: [] });
};

export const AppLogin = async (req, res) => {
  const email = req.body.email;
  const pin = req.body.pin;

  if (email && pin) {
    try {
      const select = ["id", "name", "password", "email", "user_type"];
      const where = { email: email }; // [];

      const exUser = await loginUser(select, where);

      if (exUser.code) {
        const match = await comparePasswords(pin, exUser.res.password);

        if (match) {
          const existingUser = {
            respondent_id: exUser.res.id,
            email: exUser.res.email,
          };

          const token = jwt.sign(existingUser, process.env.SECRET_KEY, {
            expiresIn: "7d", // "1h",
          });

          const cs = await getLatestSurveyConnected(exUser.res.id);

          const response = {
            token: token,
            user: {
              name: exUser.res.name,
              email: exUser.res.email,
              user_type: exUser.res.user_type,
              survey_code: cs.res.survey_code,
            },
          };

          res
            .status(200)
            .json({ message: "Login successful!", data: response });
        } else
          res
            .status(401)
            .json({ message: "Incorrect username / password.", data: [] });
      } else {
        res
          .status(400)
          .json({ message: `Error Message: ${exUser.res}`, data: [] }); //
      }
    } catch (err) {
      res.status(400).json({ message: "Error: " + err, data: [] });
    }
  } else res.status(400).json({ message: "Invalid arguments.", data: [] });
};

export const AppChangePin = async (req, res) => {
  const email = req.body.email;

  if (email) {
    try {
      const select = ["id", "name", "email", "user_type"];
      const where = [{ email: email }];

      var exUser = await findUserByUsername(select, where);
      console.log(exUser.res.id);
      if (!exUser.code) {
        res.status(404).json({
          message: "User account does not exist in our system.",
          data: [],
        });
      } else {
        var userId = exUser.res.id;
        var genpass = generateRandomNumber(8);
        var genpassword = bcrypt.hashSync(genpass.toString(), salt);
        var subject = "Password Change Request.";
        var message = `<h5>Dear User</h5> <p>Please find below your new password: <br /> <b>${genpass}</b></p>`;
        console.log(message);

        var upPass = await updateUser({ password: genpassword }, userId);
        if (upPass.code) {
          await SendEmail(email, subject, message);
          res
            .status(200)
            .json({ message: "Password Updated Successfully", data: [] });
        } else
          res.status(500).json({
            message: "There is some issue while updating password.",
            data: [],
          });
      }
    } catch (e) {
      console.log(e);
      res.status(401).json(e);
    }
  } else res.status(400).json({ message: "Invalid arguments.", data: [] });
};
