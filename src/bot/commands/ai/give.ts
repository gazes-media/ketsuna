import { ActionRowBuilder, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandsBase from "../baseCommands";
import { bt } from "../../../main";

export default async function Give(command: CommandsBase, interaction: CommandInteraction) {    
    let i = await interaction.deferReply()
    let options = interaction.options;
    let userSelected = options.getUser("user", true);
    let amount = 1;
    if(options instanceof CommandInteractionOptionResolver) {
        amount = options.getNumber("amount") || 1;
    }
    i.edit({
        content: bt.__({ phrase: "Searching for the user in the database", locale: interaction.locale }),
    });
    let giverUser = await command.client.database.users.findFirst({
        where: {
            id: interaction.user.id
        }
    });
    if (!giverUser) return i.edit({
        content: bt.__({ phrase: "You must login to StableHorde using %s", locale: interaction.locale }, `</${interaction.commandName} login:${interaction.commandId}>`),
    });
    i.edit({
        content: bt.__({ phrase: "Searching for the user in the API", locale: interaction.locale }),
    });
    let token = command.client.decryptString(giverUser.horde_token);
    let ai = command.client.aiHorde;
    try {
        let user = await ai.findUser({
            token
        });
        if(user.kudos < amount) return i.edit({
            content: bt.__({ phrase: "You don't have enough kudos", locale: interaction.locale }),
        });
        // find the other user
        let receiverUser = await command.client.database.users.findFirst({
            where: {
                id: userSelected.id
            }
        });
        if(!receiverUser) return i.edit({
            content: bt.__({ phrase: "The user is not registered", locale: interaction.locale }),
        });
        try{
            let receiverToken = command.client.decryptString(receiverUser.horde_token);
            let receiver = await ai.findUser({
                token: receiverToken
            });
            // give kudos
            
            ai.postKudosTransfer({
                username: receiver.username,
                amount
            },{
                token: token
            }).then(async (content) => {
                i.edit({
                    content: bt.__({ phrase: "You have given %s kudos to %s", locale: interaction.locale }, String(content.transferred), `<@${userSelected.id}> (${receiver.username})`),
                });
            }).catch(async (err) => {
                i.edit({
                    content: bt.__({ phrase: "An error occured", locale: interaction.locale }),
                });
            });
        }catch(e){
            return i.edit({
                content: bt.__({ phrase: "The user is not registered", locale: interaction.locale }),
            });
        }
    } catch (e) {
        return i.edit({
            content: bt.__({ phrase: "Token invalid, you must login to StableHorde using %s", locale: interaction.locale }, `</${interaction.commandName} login:${interaction.commandId}>`),
        });
    }
}

function Capitalize(str: string) {
    return `**${str.charAt(0).toUpperCase() + str.slice(1)}**`
}