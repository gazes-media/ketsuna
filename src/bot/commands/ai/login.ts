import { ActionRowBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandInteractionWebHook from "../../class/commandInteraction";
import CommandsBase from "../baseCommands";

export default async function Login(command: CommandsBase, interaction: CommandInteractionWebHook){
    let userDatabase = await command.client.database.users.findFirst({
        where: {
            id: interaction.user.id
        }
    });
    let currentToken = "";
    if (userDatabase) {
        currentToken = this.client.decryptString(userDatabase.horde_token);
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

    let token = modal.getValue("token");
    if (!token) modal.reply({
        content: "Vous devez entrer un token",
        flags: MessageFlags.Ephemeral
    });
    modal.followUp({
        content: "Vérification du token...",
        flags: MessageFlags.Ephemeral
    });
    let ai = this.client.aiHorde;
    try {
        let user = await ai.findUser({
            token
        });
    } catch (e) {
        modal.editReply({
            content: "Le token est invalide",
        });
        return;
    }
    if (userDatabase) {
        this.client.database.users.update({
            where: {
                id: interaction.user.id
            },
            data: {
                horde_token: this.client.encryptString(token)
            }
        }).then(() => {
            modal.editReply({
                content: "Token mis à jour",
            });
        }).catch((err) => {
            modal.editReply({
                content: "Une erreur est survenue",
            });
        });
    } else {
        this.client.database.users.create({
            data: {
                id: interaction.user.id,
                horde_token: this.client.encryptString(token)
            }
        }).then(() => {
            modal.editReply({
                content: "Token ajouté",
            });
        }).catch((err) => {
            modal.editReply({
                content: "Une erreur est survenue",
            });
        });
    }
}