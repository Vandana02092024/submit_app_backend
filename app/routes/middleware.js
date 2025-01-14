import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ message: "Unauthorized - Key missing" });
  }

  // API key validation logic
  if (apiKey === process.env.VALIDATION_KEY) {
    // Valid API key
    next();
  } else {
    // Invalid API key
    return res.status(401).json({ message: "Unauthorized - Invalid key" });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token missing" });
  }
  let tkn = token.replace("Bearer ", "");
  console.log(tkn);
  jwt.verify(tkn, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    req.user_type= decoded.user_type;
    req.userId = decoded.user_id;
    next();
  });
};

export default apiKeyMiddleware; // Exporting a default module
export { verifyToken }; // Exporting multiple named modules
