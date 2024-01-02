import Bot from "..";
import { ApplicationCommandType, CacheType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, Routes } from "discord.js";
import baseCommands from "./baseCommands";
const MessageCommand = new ContextMenuCommandBuilder()
    .setName("Delete Message")
    .setType(ApplicationCommandType.Message)
    .toJSON();

export class DeleteMessage extends baseCommands {
    constructor(client: Bot) {
        super(client, MessageCommand);
    }

    async run(interaction: ContextMenuCommandInteraction<CacheType>) {
        if (interaction.isMessageContextMenuCommand()) {
            if(!interaction.targetMessage.interaction) return interaction.reply({
                content: "Ce message ne peut pas être supprimé",
                ephemeral: true
            });
            if (interaction.targetMessage.interaction.user.id === interaction.user.id) {
                const i = await interaction.deferReply({
                    ephemeral: true
                });
                interaction.deleteReply(interaction.targetMessage.id).then(() => {
                    i.edit({
                        content: "Message supprimé",
                    });
                }).catch((err) => {
                    i.edit({
                        content: "Une erreur est survenue",
                    });
                });
            } else {
                interaction.reply({
                    content: "Vous ne pouvez pas supprimer ce message",
                    ephemeral: true
                });
            }
        }
    }
}