import { ActionRowBuilder, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandsBase from "../baseCommands";
import { bt } from "../../../main";

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
        content: bt.__({ phrase: "Searching for the user in the database", locale: interaction.locale }),
    });
    let userDatabase = await command.client.database.users.findFirst({
        where: {
            id: InteractionUser.id
        }
    });
    if(!userDatabase) return i.edit({
        content: bt.__({ phrase: "User not registered, you must register with %s", locale: interaction.locale }, `</${interaction.commandName} login:${interaction.commandId}>`),
    });
    i.edit({
        content: bt.__({ phrase: "Searching for the user in the API", locale: interaction.locale }),
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
                        Capitalize(bt.__({ phrase: "Usage", locale: interaction.locale })),
                        `- ${Capitalize(bt.__("Image generated"))}: ${user.records.fulfillment.image} (\`${user.records.contribution.megapixelsteps} MégaPixels\`)`,
                        `- ${Capitalize(bt.__("Image requested"))}: ${user.records.request.image} (\`${user.records.usage.megapixelsteps} MégaPixels\`)`,
                        `- ${Capitalize(bt.__("Text generated"))}: ${user.records.fulfillment.text} (\`${user.records.contribution.tokens} tokens\`)`,
                        `- ${Capitalize(bt.__("Text requested"))}: ${user.records.request.text} (\`${user.records.usage.tokens} tokens\`)`,
                        `- ${Capitalize(bt.__("Image interogated generated"))}: ${user.records.fulfillment.interrogation}`,
                        `- ${Capitalize(bt.__("Image interogated requested"))}: ${user.records.request.interrogation}`,
                        Capitalize("Kudos"),
                        `- ${Capitalize(bt.__("Total"))}: ${user.kudos}`,
                        `- ${Capitalize(bt.__("Earned"))}: ${user.kudos_details.accumulated}`,
                        `- ${Capitalize(bt.__("Admin"))}: ${user.kudos_details.admin}`,
                        `- ${Capitalize(bt.__("Given"))}: ${user.kudos_details.gifted}`,
                        `- ${Capitalize(bt.__("Received"))}: ${user.kudos_details.received}`,
                        `- ${Capitalize(bt.__("Recurring"))}: ${user.kudos_details.recurring}`,
                        Capitalize(bt.__("Workers")),
                        `- ${Capitalize(bt.__("Invited"))}: ${user.worker_invited}`,
                        `- ${Capitalize(bt.__("Contributed"))}: ${user.worker_count}`,
                    ].join("\n"))
            ]
        });
    } catch (e) {
        return i.edit({
            content: bt.__({ phrase: "Token invalid you must login again", locale: interaction.locale }),
        });
    }
}

function Capitalize(str: string) {
    return `**${str.charAt(0).toUpperCase() + str.slice(1)}**`
}