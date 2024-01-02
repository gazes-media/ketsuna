import { ApplicationCommandOption, ApplicationCommandOptionType, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageFlags } from "discord.js";
import CommandsBase from "../baseCommands";
import AdvancedImagine from "./advanced/imagine";

export default async function Advanced(command: CommandsBase, interaction: CommandInteraction) {
    if(interaction.options instanceof CommandInteractionOptionResolver){
        let commandName = interaction.options.getSubcommand();
        switch(commandName){
            case "imagine":
                await AdvancedImagine(command, interaction);
                break;
            default:
                interaction.reply({
                    content: "Commande inconnue",
                    flags: MessageFlags.Ephemeral
                });
                break;
            }
    }
}