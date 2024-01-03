import { ApplicationCommandOption, ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import CommandsBase from "../baseCommands";
import { bt } from "../../../main";

export default async function Help(command: CommandsBase, interaction: CommandInteraction) {
    let AiCommand = command.client.application.commands.cache.find((cmd) => {
        return cmd.name === interaction.commandName;
    });
    if (!AiCommand) return interaction.reply({
        content: bt.__({ phrase: "An error occurred, command not found", locale: interaction.locale }),
        flags: MessageFlags.Ephemeral
    });
    let options = AiCommand.options;
    let optionsMapped = options.flatMap((option) => {
        if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
            return option.options.map((subOption) => {
                let desc = subOption.description;
                try {
                    let localizedDesc = Object.entries(subOption.descriptionLocalizations).find((localization) => {
                        return localization[0] === interaction.locale;
                    });
                    if (localizedDesc)
                        desc = localizedDesc[1]
                } catch (_) { }
                return [`</${AiCommand.name} ${option.name} ${subOption.name}:${AiCommand.id}> - ${desc}`];
            }).join("\n");
        } else {
            let desc = option.description;
            try {
                let localizedDesc = Object.entries(option.descriptionLocalizations).find((localization) => {
                    return localization[0] === interaction.locale;
                });
                if (localizedDesc)
                    desc = localizedDesc[1]
            } catch (_) { }
            return [`</${AiCommand.name} ${option.name}:${AiCommand.id}> - ${desc}`];
        }

    }).join("\n");

    let description = bt.__({
        phrase: "Decriptions of commands\n%s\nFor the login command </%s login:%s>, you will first have to go to [AI Horde](https://stablehorde.net/register) enter a nickname, then copy the API key you will just have to paste it into the modal that will open", locale: interaction.locale
    }, optionsMapped, AiCommand.name, AiCommand.id);
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle(bt.__({ phrase: "Help of AI", locale: interaction.locale }))
                .setDescription(description)
        ],
    });
}