import Bot from "./bot";
import Website from "./website";
import express from "express";

const bot = new Bot();
const app = express();
const website = new Website(app);
bot.init();
website.init();

