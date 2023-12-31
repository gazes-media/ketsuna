import dotenv from "dotenv";
import Bot from "./bot";
import Website from "./website";
import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { I18n } from "i18n";

dotenv.config();
export const bot = new Bot();
const app = fastify();
const website = new Website(app);
const libsql = createClient({
  url: `file:prisma/local.db`,
});

const adapter = new PrismaLibSQL(libsql);
export const prisma = new PrismaClient({ adapter });
prisma
  .$connect()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Error while connecting to database: ", err);
    process.exit(1);
  });
bot.database = prisma;
bot.init();
website.init();

export const bt = new I18n();
bt.configure({
  defaultLocale: "en-GB",
  directory: "./locales/bot_i18n",
  autoReload: false,
  updateFiles: false,
});
