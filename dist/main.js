"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(exports,{bot:function(){return bot},bt:function(){return bt},prisma:function(){return prisma}});var _dotenv=_interop_require_default(require("dotenv")),_bot=_interop_require_default(require("./bot")),_website=_interop_require_default(require("./website")),_fastify=_interop_require_default(require("fastify")),_client=require("@prisma/client"),_adapterlibsql=require("@prisma/adapter-libsql"),_client1=require("@libsql/client"),_i18n=require("i18n");function _interop_require_default(e){return e&&e.__esModule?e:{default:e}}_dotenv.default.config();var bot=new _bot.default,app=(0,_fastify.default)(),website=new _website.default(app),libsql=(0,_client1.createClient)({url:"file:prisma/local.db"}),adapter=new _adapterlibsql.PrismaLibSQL(libsql),prisma=new _client.PrismaClient({adapter:adapter});prisma.$connect().then(function(){console.log("Database connected")}).catch(function(e){console.error("Error while connecting to database: ",e),process.exit(1)}),bot.database=prisma,bot.init(),website.init();var bt=new _i18n.I18n;bt.configure({defaultLocale:"en-GB",directory:"./locales/bot_i18n",autoReload:!1,updateFiles:!1});