import { ApplicationCommandOption, ApplicationCommandOptionType, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageFlags } from "discord.js";
import CommandsBase from "../baseCommands";
import AdvancedImagine from "./advanced/imagine";
import { bt } from "../../../main";

export default async function Advanced(command: CommandsBase, interaction: CommandInteraction) {
    if(interaction.options instanceof CommandInteractionOptionResolver){
        let commandName = interaction.options.getSubcommand();
        switch(commandName){
            case "imagine":
                await AdvancedImagine(command, interaction);
                break;
            default:
                interaction.reply({
                    content: bt.__({ phrase: "Unknown command", locale: interaction.locale }),
                    flags: MessageFlags.Ephemeral
                });
                break;
            }
    }
}