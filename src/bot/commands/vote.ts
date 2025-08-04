import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CommandInteraction,
  CommandInteractionOptionResolver,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import CommandsBase from "./baseCommands";
import Bot from "../index";
import { bt } from "../../main";

const commandData = new SlashCommandBuilder()
  .setName("vote")
  .setDescription("vote")

export class GayCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }
 
 async run(interaction: CommandInteraction){
  let i = await interaction.deferReply(); 
  const randomPercentage = Math.floor(Math.random() * 101); 
  i.edit({
    content: bt.__({
      phrase: "https://top.gg/fr/bot/1190014646351036577",
      locale: interaction.locale,
    }, randomPercentage.toString()),
  });
  }
}