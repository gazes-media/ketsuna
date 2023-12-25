import dotenv from "dotenv";
import Bot from "./bot";
import Website from "./website";
import fastify from "fastify";
dotenv.config();
export const bot = new Bot();
const app = fastify();
const website = new Website(app);
 
bot.init();
website.init();

