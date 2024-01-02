import { ActionRowBuilder, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandsBase from "../baseCommands";

export default async function Give(command: CommandsBase, interaction: CommandInteraction) {    
    let i = await interaction.deferReply()
    let options = interaction.options;
    let userSelected = options.getUser("user", true);
    let amount = 1;
    if(options instanceof CommandInteractionOptionResolver) {
        amount = options.getNumber("amount") || 1;
    }
    i.edit({
        content: "Recherche en cours de l'utilisateur dans la base de donnée",
    });
    let giverUser = await command.client.database.users.findFirst({
        where: {
            id: interaction.user.id
        }
    });
    if (!giverUser) return i.edit({
        content: "Vous n'êtes pas enregistré" + `, vous devez vous enregistrer avec la commande </${interaction.commandName} login:${interaction.commandId}>`,
    });
    i.edit({
        content: "Recherche en cours de l'utilisateur dans l'API",
    });
    let token = command.client.decryptString(giverUser.horde_token);
    let ai = command.client.aiHorde;
    try {
        let user = await ai.findUser({
            token
        });
        if(user.kudos < amount) return i.edit({
            content: "Vous n'avez pas assez de kudos",
        });
        // find the other user
        let receiverUser = await command.client.database.users.findFirst({
            where: {
                id: userSelected.id
            }
        });
        if(!receiverUser) return i.edit({
            content: "L'utilisateur n'est pas enregistré",
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
                    content:`Vous avez donné ${content.transferred} kudos à <@${userSelected.id}> (${receiver.username})`
                });
            }).catch(async (err) => {
                i.edit({
                    content: "Une erreur est survenue lors du transfert de kudos, réessayer",
                });
            });
        }catch(e){
            return i.edit({
                content: "L'utilisateur cible n'est pas enregistré",
            });
        }
    } catch (e) {
        return i.edit({
            content: "Le token est invalide vous devez vous reconnecter",
        });
    }
}

function Capitalize(str: string) {
    return `**${str.charAt(0).toUpperCase() + str.slice(1)}**`
}