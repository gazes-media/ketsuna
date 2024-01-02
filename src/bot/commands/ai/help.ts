import { ApplicationCommandOption, ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import CommandsBase from "../baseCommands";

export default async function Help(command: CommandsBase, interaction: CommandInteraction) {
    let AiCommand = command.client.application.commands.cache.find((cmd) => {
        return cmd.name === interaction.commandName;
    });
    if (!AiCommand) return interaction.reply({
        content: "Une erreur est survenue commande introuvable",
        flags: MessageFlags.Ephemeral
    });
    let options = AiCommand.options;
    if (!options) return interaction.reply({
        content: "Une erreur est survenue options indisponibles",
        flags: MessageFlags.Ephemeral
    });
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

    let description = `Descriptions des commandes\n${optionsMapped}\nPour la commande de connexion </${AiCommand.name} login:${AiCommand.id}>, vous devrez d'abord allez sur [AI Horde](https://stablehorde.net/register) entrez un pseudo, puis copier la clé d'API vous aurez juste à la coller dans la modale qui s'ouvrira`;
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Liste des commandes AI")
                .setDescription(description)
        ],
    });
}