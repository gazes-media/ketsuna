import {
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import CommandsBase from "./baseCommands";
import Bot from "../index";

const commandData = new SlashCommandBuilder()
  .setName("uptime")
  .setDescription("Show how long the bot has been online.");

export class UptimeCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction) {
    const uptime = process.uptime();
    const formatted = formatUptime(uptime);
    await interaction.reply(`🕒 The bot has been online for **${formatted}**.`);
  }
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}
