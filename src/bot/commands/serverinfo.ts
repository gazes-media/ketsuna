import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandsBase from "./baseCommands";
import Bot from "../index";

const commandData = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Displays information about the server");

export class ServerInfoCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction) {

    const guild = interaction.guild;
    const memberCount = guild?.memberCount;
    const createdAt = guild?.createdAt.toDateString();
    const owner = await guild?.fetchOwner();

    await interaction.reply({
      content: `Server Info:
      - Name: ${guild?.name}
      - ID: ${guild?.id}
      - Created on: ${createdAt}
      - Owner: ${owner?.user.tag}
      - Members: ${memberCount}`,
    });
  }
}
