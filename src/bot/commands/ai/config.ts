import {
    ActionRowBuilder,
    Colors,
    CommandInteraction,
    EmbedBuilder,
    InteractionResponse,
    MessageFlags,
    MessagePayload,
    ModalBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
    WebhookMessageEditOptions,
  } from "discord.js";
  import CommandsBase from "../baseCommands";
  import { bt } from "../../../main";
import Login from "./login";
  
  export default async function Config(
    command: CommandsBase,
    interaction: CommandInteraction,
  ) {
    let userDatabase = await command.client.database.users.findFirst({
      where: {
        id: interaction.user.id,
      },
      select: {
        horde_config: {
            select: {
                definedPrompt: true,
                model: true,
                loras: true,
            }
        },
        horde_token: true,
        },
    });
    let loginInteraction: InteractionResponse<boolean> | undefined;
    let currentToken = "";
    if (userDatabase) {
      currentToken = command.client.decryptString(userDatabase.horde_token);
    }else{
        loginInteraction = await Login(command, interaction);
    }

    if(loginInteraction){
        return loginInteraction.edit({
            content: bt.__({
              phrase: "Write the command again to continue",
              locale: interaction.locale,
            }),
        });
    }

    let message: WebhookMessageEditOptions = {
        embeds: [
            new EmbedBuilder()
            .setTitle(
                bt.__({ phrase: "StableHorde Configuration", locale: interaction.locale }),
              )
            .setDescription(
                bt.__({ phrase: "Configure StableHorde", locale: interaction.locale }),
              )
            .setColor(Colors.Orange)
            .setTimestamp()
            .addFields({
                    name: bt.__({ phrase: "Model", locale: interaction.locale }),
                    value: userDatabase.horde_config?.model || "Not set",
                    inline: true
            }).addFields({
                name: bt.__({ phrase: "Prompt", locale: interaction.locale }),
                value: userDatabase.horde_config?.definedPrompt || "Not set",
                inline: true
            })
        ],
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId("config_options")
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setPlaceholder(bt.__({ phrase: "Select an option", locale: interaction.locale }))
                    .addOptions([
                        {
                            label: bt.__({ phrase: "Model", locale: interaction.locale }),
                            description: bt.__({ phrase: "Change the model", locale: interaction.locale }),
                            value: "model",
                        },
                        {
                            label: bt.__({ phrase: "Prompt", locale: interaction.locale }),
                            description: bt.__({ phrase: "Change the prompt", locale: interaction.locale }),
                            value: "prompt",
                        },
                    ])
            ])
        ]
    }

    let deferred = await interaction.deferReply();
    if(interaction.isCommand()){
        deferred.edit(message);

        deferred.createMessageComponentCollector({
            filter: (componentInteraction) => {
                return (
                    componentInteraction.user.id === interaction.user.id && componentInteraction.isStringSelectMenu()
                );
                },
                time: 1000 * 60 * 10,
                dispose: true,
        }).on("collect", async (componentInteraction) => {
            if(componentInteraction.isStringSelectMenu()){
                let option = componentInteraction.values[0];
                switch(option){
                    case "model":
                        await componentInteraction.deferUpdate();
                        await componentInteraction.editReply({
                            content: bt.__({
                                phrase: "Write the command again to continue",
                                locale: interaction.locale,
                              }),
                        });
                        break;
                    case "prompt":
                        await componentInteraction.deferUpdate();
                        await componentInteraction.editReply({
                            content: bt.__({
                                phrase: "Write the command again to continue",
                                locale: interaction.locale,
                              }),
                        });
                        break;
                }
                // update User database this need to be reviewed, some Options will be Autocompleted to avoid errors and to make it easier for the user
                command.client.database.users.update({
                    where: {
                        id: interaction.user.id,
                    },
                    data: {
                        horde_config: {
                            update: {
                                model: "test",
                            }
                        }
                    }
                })
            }
        });

    }
  }
  