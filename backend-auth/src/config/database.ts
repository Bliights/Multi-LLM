import {Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME as string,
    process.env.DB_USER_NAME as string,
    process.env.DB_USER_PW as string,
    {
        host: process.env.DB_SERV as string,
        port: parseInt(process.env.DB_PORT as string, 10),
        dialect: "postgres",
        logging: false,
    }
);

export default sequelize;