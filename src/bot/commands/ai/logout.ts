import { ActionRowBuilder, CommandInteraction, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandsBase from "../baseCommands";

export default async function Logout(command: CommandsBase, interaction: CommandInteraction) {
    try {
        let userDatabase = await command.client.database.users.delete({
            where: {
                id: interaction.user.id
            }
        });
        if (userDatabase) {
            interaction.reply({
                content: "Vous avez été déconnecté",
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (err) {
        interaction.reply({
            content: "Vous n'etiiez pas enregistré",
            flags: MessageFlags.Ephemeral
        });
    }
}