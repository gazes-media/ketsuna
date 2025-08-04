import dotenv from "dotenv";
import Bot from "./bot"; // Assure-toi que la classe Bot est bien définie pour gérer ton bot
import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { I18n } from "i18n";
import { Client, EmbedBuilder } from "discord.js"; // Importation de discord.js pour la gestion des commandes

dotenv.config();
export const bot = new Bot();
const app = fastify();
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

export const bt = new I18n();
bt.configure({
  defaultLocale: "en-GB",
  directory: "./locales/bot_i18n",
  autoReload: false,
  updateFiles: false,
});

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });

client.once("ready", () => {
  console.log(`[Bot] Logged in as ${client.user?.tag}.`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Commande !shardinfsrv
  if (message.content === "!shardinfsrv") {
    if (message.client.shard) {
      const shardId = message.client.shard.ids[0];

      const embed = new EmbedBuilder()
        .setTitle("Shard Information")
        .setColor("Blue")
        .setDescription(`This command was executed on shard **${shardId}**.`);

      await message.reply({ embeds: [embed] });
    } else {
      await message.reply("The bot is not using sharding.");
    }
  }

  // Commande !shardstats
  if (message.content === "!shardstats") {
    if (message.client.shard) {
      try {
        // Récupérer les statistiques des shards
        const results = await message.client.shard.broadcastEval(client => {
          return {
            shardId: client.shard?.ids[0] || 0,
            guildCount: client.guilds.cache.size,
            memberCount: client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0),
          };
        });

        // Construction de l'embed avec les informations
        const embed = new EmbedBuilder()
          .setTitle("Shard Statistics")
          .setColor("Green");

        results.forEach((shard: any) => {
          embed.addFields([
            { name: `Shard ${shard.shardId}`, value: `Servers: ${shard.guildCount}\nMembers: ${shard.memberCount}`, inline: false },
          ]);
        });

        // Réponse avec l'embed
        await message.reply({ embeds: [embed] });
      } catch (err) {
        console.error("Error fetching shard stats:", err);
        await message.reply("An error occurred while fetching shard stats.");
      }
    } else {
      await message.reply("The bot is not using sharding.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
