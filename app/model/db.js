import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: console.log,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfuly!");
  } catch (error) {
    console.error("There is some issue while conneting DB: ", error);
  }
}

connectDB();

export default sequelize;
