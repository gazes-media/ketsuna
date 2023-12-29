import { ActionRowBuilder, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandsBase from "../baseCommands";

export default async function Info(command: CommandsBase, interaction: CommandInteraction) {    
    let i = await interaction.deferReply()
    let options = interaction.options;
    let InteractionUser = interaction.user;
    let notTheCurrentUser = false;
    if (options instanceof CommandInteractionOptionResolver) {
        let userSelected = options.getUser("user", false);
        if (userSelected) {
            InteractionUser = userSelected;
            notTheCurrentUser = true;
        }
    }

    i.edit({
        content: "Recherche en cours de l'utilisateur dans la base de donnée",
    });
    let userDatabase = await command.client.database.users.findFirst({
        where: {
            id: InteractionUser.id
        }
    });
    if (!userDatabase) return i.edit({
        content: notTheCurrentUser ? "L'utilisateur n'est pas enregistré" : "Vous n'êtes pas enregistré" + `, ${notTheCurrentUser ? "il doit s'" : "vous devez vous"} enregistrer avec la commande </${interaction.commandName} login:${interaction.commandId}>`,
    });
    i.edit({
        content: "Recherche en cours de l'utilisateur dans l'API",
    });
    let token = command.client.decryptString(userDatabase.horde_token);
    let ai = command.client.aiHorde;
    try {
        let user = await ai.findUser({
            token
        });
        i.edit({
            content:"",
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Info de ${user.username}`)
                    .setDescription([
                        Capitalize("Utilisation"),
                        `- ${Capitalize("Image générée")}: ${user.records.fulfillment.image} (\`${user.records.contribution.megapixelsteps} MégaPixels\`)`,
                        `- ${Capitalize("Image demandé")}: ${user.records.request.image} (\`${user.records.usage.megapixelsteps} MégaPixels\`)`,
                        `- ${Capitalize("Texte généré")}: ${user.records.fulfillment.text} (\`${user.records.contribution.tokens} tokens\`)`,
                        `- ${Capitalize("Texte demandé")}: ${user.records.request.text} (\`${user.records.usage.tokens} tokens\`)`,
                        `- ${Capitalize("Image évaluée généré")}: ${user.records.fulfillment.interrogation}`,
                        `- ${Capitalize("Image évaluée demandé")}: ${user.records.request.interrogation}`,
                        Capitalize("Kudos"),
                        `- ${Capitalize("Total")}: ${user.kudos}`,
                        `- ${Capitalize("Gagné")}: ${user.kudos_details.accumulated}`,
                        `- ${Capitalize("Admin")}: ${user.kudos_details.admin}`,
                        `- ${Capitalize("Donnée")}: ${user.kudos_details.gifted}`,
                        `- ${Capitalize("Reçu")}: ${user.kudos_details.received}`,
                        `- ${Capitalize("Récurent")}: ${user.kudos_details.recurring}`,
                        Capitalize("Workers"),
                        `- ${Capitalize("Invités")}: ${user.worker_invited}`,
                        `- ${Capitalize("Contribué")}: ${user.worker_count}`,
                    ].join("\n"))
            ]
        });
    } catch (e) {
        return i.edit({
            content: "Le token est invalide vous devez vous reconnecter",
        });
    }
}

function Capitalize(str: string) {
    return `**${str.charAt(0).toUpperCase() + str.slice(1)}**`
}