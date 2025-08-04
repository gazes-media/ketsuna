import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import os from "os";
import process from "process";
import CommandsBase from "./baseCommands";
import Bot from "../index";

const commandData = new SlashCommandBuilder()
  .setName("botstats")
  .setDescription("Show bot system and performance stats.");

export class BotStatsCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction) {
    await interaction.deferReply();

    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const embed = new EmbedBuilder()
      .setTitle("📈 Bot Stats")
      .setColor("Green")
      .addFields([
        { name: "🧠 RAM", value: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: "🕒 Uptime", value: formatUptime(uptime), inline: true },
        { name: "💻 Platform", value: `${os.type()} ${os.release()} (${os.arch()})`, inline: false },
        { name: "🧰 Node.js", value: process.version, inline: true },
        { name: "📦 Discord.js", value: `v${require("discord.js").version}`, inline: true },
      ])
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}
