import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import CommandsBase from "./baseCommands";
import Bot from "../index";

const commandData = new SlashCommandBuilder()
  .setName("shardstats")
  .setDescription("Displays statistics for all bot shards.");

export class ShardStatsCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction) {
    await interaction.deferReply();

    const shardData = await interaction.client.shard?.broadcastEval(client => ({
      shardId: client.shard?.ids[0] ?? 0,
      guildCount: client.guilds.cache.size,
      memberCount: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
      ping: client.ws.ping
    }));

    if (!shardData) {
      return interaction.editReply({ content: "⚠️ Failed to fetch shard stats." });
    }

    const totalServers = shardData.reduce((acc, s) => acc + s.guildCount, 0);
    const totalMembers = shardData.reduce((acc, s) => acc + s.memberCount, 0);

    const embed = new EmbedBuilder()
      .setTitle("📊 Shard Statistics")
      .setColor("Blue")
      .addFields(
        ...shardData.map((s) => ({
          name: `Shard ${s.shardId}`,
          value: `🧩 Servers: **${s.guildCount}**\n👥 Members: **${s.memberCount}**\n📡 Ping: **${s.ping}ms**`,
          inline: true,
        })),
        {
          name: "🌍 Total",
          value: `**Servers:** ${totalServers}\n**Members:** ${totalMembers}`,
          inline: false,
        }
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
}
