import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import CommandsBase from "./baseCommands";
import Bot from "../index";
import { bt } from "../../main";

// Définir la commande
const commandData = new SlashCommandBuilder()
  .setName("shardinfsrv")
  .setDescription("Get detailed shard information");

// Classe pour la commande
export class ShardInfoCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction) {
    let i = await interaction.deferReply();

    // Vérifier si le bot utilise le sharding
    if (interaction.client.shard) {
      const shardId = interaction.client.shard.ids[0];  // Utiliser ids[0] pour obtenir l'ID du shard actuel

      // Récupérer des informations sur tous les shards
      const shardInfo = await interaction.client.shard!.broadcastEval(client => {
        return {
          id: client.shard.ids[0],
          guilds: client.guilds.cache.size,
          members: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
          uptime: client.uptime || 0,
        };
      });

      const shardCount = shardInfo.length;  // Nombre total de shards
      const currentShard = shardInfo.find(info => info.id === shardId); // Trouver les informations pour le shard actuel

      if (!currentShard) {
        await i.edit("Error retrieving shard information.");
        return;
      }

      // Calculer l'uptime au format lisible (en secondes)
      const uptimeInSeconds = Math.floor(currentShard.uptime / 1000);
      const uptime = `${Math.floor(uptimeInSeconds / 3600)}h ${Math.floor((uptimeInSeconds % 3600) / 60)}m ${uptimeInSeconds % 60}s`;

      // Création de l'embed avec toutes les informations
      const embed = new EmbedBuilder()
        .setTitle("Shard Information")
        .setColor("Blue")
        .setDescription(`Your is shard **${shardId}**`)
        .addFields([
          {
            name: "Servers on this Shard",
            value: `${currentShard.guilds} servers`,
            inline: true,
          },
          {
            name: "Users on this Shard",
            value: `${currentShard.members} users`,
            inline: true,
          },
          {
            name: "Total Shards",
            value: `${shardCount} shards online`,
            inline: true,
          },
          {
            name: "Shard Uptime",
            value: `${uptime}`,
            inline: true,
          },
        ]);

      // Répondre avec l'embed
      await i.edit({ embeds: [embed] });
    } else {
      await i.edit("The bot is not using sharding.");
    }
  }
}
