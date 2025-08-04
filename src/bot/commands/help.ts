import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandsBase from "./baseCommands";
import Bot from "../index";

const commandData = new SlashCommandBuilder()
  .setName("help")
  .setDescription("List all available commands and their descriptions");

export class HelpCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction) {

    // Liste des commandes et descriptions
    const commandsList = [
      {
        name: "/luck",
        description: "Check your luck with a random percentage.",
      },
      {
        name: "/help",
        description: "List all available commands and their descriptions.",
      },
      {
        name: "/worker",
        description: "Show AI Horde Worker Information",
      },
      {
        name: "/ping",
        description: "Shows the bot's ping on the discord api",
      },
      {
        name: "/vote",
        description: "vote",
      },
      {
        name: "/avatar",
        description: "Show your avatar",
      },
      {
        name: "/ai help",
        description: "Show IA help",
      },
      // Ajoutez d'autres commandes ici
    ];

    // Création du message avec les commandes disponibles
    const commandDescriptions = commandsList
      .map(
        (cmd) => `**${cmd.name}**: ${cmd.description}`
      )
      .join("\n");

    // Répondre à l'interaction avec la liste des commandes
    await interaction.reply({
      content: `Here are all the available commands:\n\n${commandDescriptions}`,
    });
  }
}
