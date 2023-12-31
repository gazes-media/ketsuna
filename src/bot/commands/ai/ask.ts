import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import CommandsBase from "../baseCommands";
import { GenerationInputKobold } from "../../../internal_libs/aihorde";

export default async function Ask(command: CommandsBase, interaction: CommandInteraction) {    
    let i = await interaction.deferReply()
    let options = interaction.options;
    let ia = command.client.aiHorde;
    let userToken = "0000000000"
    try{
    userToken = await new Promise<string>((resolve, reject) => {
        command.client.database.users.findFirst({
            where: {
                id: interaction.user.id
            }
        }).then((user) => {
            if(!user) return reject("Vous n'êtes pas enregistré");
            resolve(command.client.decryptString(user.horde_token));
        }).catch(reject);
    });
    }catch(err){
        i.edit({
            content:"User not registered operation start with default token"
        });
    }
    
    let question= "", temperature, topP, frequencyPenalty;
    if(options instanceof CommandInteractionOptionResolver){
        question = options.getString("question", true);
        temperature = options.getNumber("temperature", false);
        topP = options.getNumber("top-p", false);
        frequencyPenalty = options.getNumber("frequency-penalty", false);
    }

    let askData: GenerationInputKobold = {
        prompt: question,
        params: {
            max_length: 200,
            singleline: true,
            frmttriminc: true,
            frmtrmspch: true,
            frmtrmblln: true,
        }
    }
    if(topP) askData.params.top_p = topP;
    if(temperature) askData.params.temperature = temperature;
    if(frequencyPenalty) askData.params.rep_pen = frequencyPenalty;
    let asked = ia.postAsyncTextGenerate(askData,{
        token: userToken
    });

    let DateStart = Date.now();

    asked.then((asked) => {
        i.edit({
            content: "Requête envoyé à l'IA, veuillez patienter...",
        });
        let buttonCollector = i.createMessageComponentCollector({
            filter: (interactor) => {
                return interactor.user.id === interaction.user.id && interactor.customId === "cancel";
            },
            max: 1,
        });
        const intervalCheck = setInterval(() => {
            ia.getTextGenerationStatus(asked.id).then((stat) => {
                if(stat.done){
                    let DateEnd = Date.now();
                    clearInterval(intervalCheck);
                    let embed = new EmbedBuilder();
                    embed.setTitle("Résultat de l'IA");
                    embed.setDescription(stat.generations[0].text);
                    embed.setFooter({
                        text: `Généré en ${DateEnd - DateStart}ms`
                    });
                    i.edit({
                        content: "",
                        embeds: [embed],
                        components: []
                    });
                }else{
                    let wait_time = stat.wait_time || 1;
                    let processed = "Requête envoyé à l'IA, veuillez patienter...\n";
                    if (stat.queue_position && stat.queue_position > 0) {
                        processed += ` (Position dans la file d'attente: ${stat.queue_position} -`;
                    }
                    if (stat.waiting && stat.waiting > 0) {
                        processed += ` En attente: ${stat.waiting})\n`;
                    }
                    if (stat.processing && stat.processing > 0) {
                        processed += `(En cours de traitement: ${stat.processing})\n`;
                        processed += `(Temps d'attente estimé: <t:${parseInt((((Date.now() + (wait_time) * 1000)) / 1000).toString())}:R>)\n`;
                    }
                    if (stat.kudos && stat.kudos > 0) {
                        processed += `(Kudos utilisés: ${stat.kudos})`;
                    }
                    i.edit({
                        content: processed,
                        components: [
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId("cancel").setLabel("Annuler").setStyle(ButtonStyle.Danger)
                            )
                        ]
                    });
                }
            }).catch((err) => {
                clearInterval(intervalCheck);
                ia.deleteTextGenerationRequest(asked.id);
                i.edit({
                    content: "Une erreur est survenue",
                });
            });
        },5000);

        buttonCollector.on("collect", (interactor) => {
            clearInterval(intervalCheck);
            ia.deleteTextGenerationRequest(asked.id);
            interactor.update({
                content: "Requête annulé",
                components: []
            });
        });
    }).catch((err) => {
        console.log(err);
        i.edit({
            content: "Une erreur est survenue, requête impossible",
        });
    });


}
