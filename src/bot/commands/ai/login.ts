import { ActionRowBuilder, CommandInteraction, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandsBase from "../baseCommands";

export default async function Login(command: CommandsBase, interaction: CommandInteraction) {
    let userDatabase = await command.client.database.users.findFirst({
        where: {
            id: interaction.user.id
        }
    });
    let currentToken = "";
    if (userDatabase) {
        currentToken = command.client.decryptString(userDatabase.horde_token);
    }
    interaction.showModal(new ModalBuilder()
        .setTitle("Connexion à l'IA Horde")
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>()
                .addComponents(
                    [new TextInputBuilder()
                        .setCustomId("token")
                        .setPlaceholder("Token")
                        .setMaxLength(100)
                        .setStyle(TextInputStyle.Short)
                        .setValue(currentToken)
                        .setRequired(true)
                        .setLabel("Token")
                    ]
                )
        )
        .setCustomId("login")
        .toJSON())

    let modal = await interaction.awaitModalSubmit({
        filter: (componentInteraction) => {
            return componentInteraction.customId === "login" && componentInteraction.user.id === interaction.user.id;
        },
        time: 1000 * 60 * 10,
        dispose: true,
    })

    let token = modal.fields.getTextInputValue("token")
    if (!token) {
        return modal.reply({
            content: "Vous devez entrer un token",
            flags: MessageFlags.Ephemeral
        });
    }
    
    if (modal.deferred) return;
    let modalInteraction = await modal.deferReply();
    let ai = command.client.aiHorde;
    try {
        let user = await ai.findUser({
            token
        });
    } catch (e) {
        modalInteraction.edit({
            content: "Le token est invalide",
        });
        return;
    }
    if (userDatabase) {
        command.client.database.users.update({
            where: {
                id: interaction.user.id
            },
            data: {
                horde_token: command.client.encryptString(token)
            }
        }).then(() => {
            modalInteraction.edit({
                content: "Token mis à jour",
            });
        }).catch((err) => {
            modalInteraction.edit({
                content: "Une erreur est survenue",
            });
        });
    } else {
        command.client.database.users.create({
            data: {
                id: interaction.user.id,
                horde_token: command.client.encryptString(token)
            }
        }).then(() => {
            modalInteraction.edit({
                content: "Token ajouté",
            });
        }).catch((err) => {
            modalInteraction.edit({
                content: "Une erreur est survenue",
            });
        });
    }
}