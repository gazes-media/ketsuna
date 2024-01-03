import Bot from "..";
import { ApplicationCommandType, CacheType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, Routes } from "discord.js";
import baseCommands from "./baseCommands";
import { bt } from "../../main";
const MessageCommand = new ContextMenuCommandBuilder()
    .setName("Delete Message")
    .setNameLocalizations({
        fr: "Supprimer le message",
    })
    .setType(ApplicationCommandType.Message)
    .toJSON();

export class DeleteMessage extends baseCommands {
    constructor(client: Bot) {
        super(client, MessageCommand);
    }

    async run(interaction: ContextMenuCommandInteraction<CacheType>) {
        if (interaction.isMessageContextMenuCommand()) {
            if(!interaction.targetMessage.interaction) return interaction.reply({
                content: bt.__({ phrase: "This message is not a command", locale: interaction.locale }),
                ephemeral: true
            });
            if (interaction.targetMessage.interaction.user.id === interaction.user.id) {
                const i = await interaction.deferReply({
                    ephemeral: true
                });
                interaction.deleteReply(interaction.targetMessage.id).then(() => {
                    i.edit({
                        content: bt.__({ phrase: "Message deleted", locale: interaction.locale }),
                    });
                }).catch((err) => {
                    i.edit({
                        content: bt.__({ phrase: "An error occurred, the message could not be deleted", locale: interaction.locale }),
                    });
                });
            } else {
                interaction.reply({
                    content: bt.__({ phrase: "You can't delete this message", locale: interaction.locale }),
                    ephemeral: true
                });
            }
        }
    }
}