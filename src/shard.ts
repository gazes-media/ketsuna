import { ShardingManager, Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Vérification des variables d'environnement
const TOKEN = process.env.DISCORD_TOKEN;
const SERVERS_PER_SHARD = parseInt(process.env.SERVERS_PER_SHARD || "50", 10);
const OWNER_ID = process.env.OWNER_ID;

if (!TOKEN) {
  console.error("The bot's token is not defined. Please check your .env file.");
  process.exit(1);
}

if (!SERVERS_PER_SHARD) {
  console.error("The variable SERVERS_PER_SHARD is not correctly defined. Please check your .env file.");
  process.exit(1);
}

if (!OWNER_ID) {
  console.error("The OWNER_ID variable is not defined. Please check your .env file.");
  process.exit(1);
}

// Initialisation du client Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", () => {
  console.log(`[Bot] Logged in as ${client.user?.tag}.`);

  // Calculer dynamiquement le nombre de guildes
  const GUILD_COUNT = client.guilds.cache.size;

  if (GUILD_COUNT === 0) {
    console.log("[ShardManager] The bot is not in any guilds. Exiting...");
    process.exit(1); // Si le bot n'est dans aucune guilde, sortir
  }

  // Calculer dynamiquement le nombre de shards nécessaires
  const shardCount = Math.max(1, Math.ceil(GUILD_COUNT / SERVERS_PER_SHARD));
  console.log(`[ShardManager] Calculated number of shards: ${shardCount} shard(s) needed.`);

  // Chemin pour stocker la whitelist
  const whitelistFilePath = path.resolve(__dirname, "../whitelist.json");

  // Fonction utilitaire pour gérer la whitelist
  function readWhitelist(): Set<string> {
    if (!fs.existsSync(whitelistFilePath)) return new Set();
    const data = JSON.parse(fs.readFileSync(whitelistFilePath, "utf-8"));
    return new Set(data);
  }

  function writeWhitelist(whitelistSet: Set<string>) {
    fs.writeFileSync(whitelistFilePath, JSON.stringify(Array.from(whitelistSet)), "utf-8");
  }

  // Charger la whitelist existante
  const whitelist: Set<string> = readWhitelist();

  // Variables pour suivre les états des shards
  const shardStatuses: string[] = new Array(shardCount).fill("Unknown");

  // Initialisation du ShardingManager
  const manager = new ShardingManager("./dist/main.js", {
    token: TOKEN,
    totalShards: shardCount,
    respawn: true,
  });

  // Suivi des événements des shards
  manager.on("shardCreate", (shard) => {
    console.log(`[ShardManager] Shard ${shard.id} has been created.`);
    shardStatuses[shard.id] = "Launching";

    shard.once("ready", () => {
      shardStatuses[shard.id] = "Online";
    });

    shard.once("disconnect", () => {
      shardStatuses[shard.id] = "Disconnected";
    });

    shard.once("death", () => {
      shardStatuses[shard.id] = "Dead";
    });
  });

  // Lancer les shards
  manager
    .spawn({ delay: 5500, timeout: 30000 })
    .then(() => console.log("[ShardManager] All shards have been launched."))
    .catch((err) => console.error("[ShardManager] Error while launching shards:", err));

  // Commande pour lister les shards
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Commande `!shhelp`
    if (message.content === "!shhelp") {
      const embed = new EmbedBuilder()
        .setTitle("Available Commands")
        .setColor("Green")
        .setDescription(
          "Here are the commands you can use:\n\n" +
          "**!addwhitelist <user_id>**: Adds a user to the whitelist (Owner only).\n" +
          "**!removewhitelist <user_id>**: Removes a user from the whitelist (Owner only).\n" +
          "**!listwhitelist**: Lists all users in the whitelist (Owner only).\n" +
          "**!restartshard <id>**: Restarts a specific shard (whitelisted users only).\n" +
          "**!shardstart**: Starts a new shard (whitelisted users only).\n" +
          "**!shard**: Displays information about all shards.\n" +
          "**!srvshard**: Lists servers managed by each shard (Owner only)."
        )
        .setFooter({ text: "Use each command with the correct format." });

      message.reply({ embeds: [embed] });
    }

    // Commande `!addwhitelist`
    if (message.content.startsWith("!addwhitelist")) {
      const args = message.content.split(" ");
      if (args.length !== 2 || !args[1].match(/\d{18}/)) {
        return message.reply("Usage: `!addwhitelist <user_id>`.");
      }

      const userId = args[1];
      if (message.author.id !== OWNER_ID) {
        return message.reply("You do not have permission.");
      }

      whitelist.add(userId);
      writeWhitelist(whitelist); // Ne pas oublier d'écrire la whitelist après modification
      return message.reply(`${userId} has been added to the whitelist.`);
    }

    // Commande `!removewhitelist`
    if (message.content.startsWith("!removewhitelist")) {
      const args = message.content.split(" ");
      if (args.length !== 2 || !args[1].match(/^\d{18}$/)) {
        return message.reply("Usage: `!removewhitelist <user_id>`.");
      }

      const userId = args[1];
      if (message.author.id !== OWNER_ID) {
        return message.reply("You do not have permission.");
      }

      whitelist.delete(userId);
      writeWhitelist(whitelist);
      return message.reply(`${userId} has been removed from the whitelist.`);
    }

    // Commande `!listwhitelist`
    if (message.content === "!listwhitelist") {
      if (message.author.id !== OWNER_ID) {
        return message.reply("You do not have permission.");
      }

      if (whitelist.size === 0) {
        return message.reply("The whitelist is empty.");
      }

      const whitelistList = Array.from(whitelist).join("\n");
      return message.reply(`Users in the whitelist:\n${whitelistList}`);
    }

    // Commande `!restartshard`
    if (message.content.startsWith("!restartshard")) {
      const args = message.content.split(" ");
      if (args.length !== 2 || isNaN(parseInt(args[1], 10))) {
        return message.reply("Usage: `!restartshard <id>`.");
      }

      const shardId = parseInt(args[1], 10);
      if (!whitelist.has(message.author.id)) {
        return message.reply("You do not have permission.");
      }

      const shard = manager.shards.get(shardId);
      if (!shard) {
        return message.reply(`Shard ${shardId} does not exist.`);
      }

      shard.respawn();
      return message.reply(`Shard ${shardId} has been restarted.`);
    }

    // Commande `!shardstart`
    if (message.content === "!shardstart") {
      let totalShards = manager.totalShards;

      if (typeof totalShards !== "number") {
        totalShards = Number(totalShards);
        if (isNaN(totalShards)) {
          return message.reply("Failed to determine the current total shards.");
        }
      }

      const nextShardId = totalShards; // Le nouvel ID est après le dernier shard existant
      manager.totalShards = totalShards + 1; // Augmenter le nombre total de shards

      try {
        const newShard = manager.createShard(nextShardId);
        newShard.spawn(); // Lancer le nouveau shard
        return message.reply(`A new shard (ID: ${nextShardId}) has been started.`);
      } catch (error) {
        console.error("Error starting a new shard:", error);
        return message.reply(
          "Failed to start a new shard. Please check the logs for more details."
        );
      }
    }

    // Commande `!shard`
    if (message.content === "!shard") {
      const status = shardStatuses
        .map((state, index) => `Shard ${index}: ${state}`)
        .join("\n");

      message.reply(`Shard statuses:\n${status}`);
    }
  });
});

// Connexion du bot
client.login(TOKEN).catch((err) => {
  console.error("[Bot] Login failed:", err);
});
