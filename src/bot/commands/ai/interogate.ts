import {
  ActionRowBuilder,
  Attachment,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import CommandsBase from "../baseCommands";
import {
  GenerationInputKobold,
  HordeAsyncRequestStates,
  ModelInterrogationFormTypes,
} from "@zeldafan0225/ai_horde";
import { bt } from "../../../main";

export default async function Interogate(
  command: CommandsBase,
  interaction: CommandInteraction,
) {
  let i = await interaction.deferReply();
  let options = interaction.options;
  let ia = command.client.aiHorde;
  let userToken = "0000000000";
  try {
    userToken = await new Promise<string>((resolve, reject) => {
      command.client.database.users
        .findFirst({
          where: {
            id: interaction.user.id,
          },
        })
        .then((user) => {
          if (!user) return reject("Vous n'êtes pas enregistré");
          resolve(command.client.decryptString(user.horde_token));
        })
        .catch(reject);
    });
  } catch (err) {
    i.edit({
      content: bt.__({
        phrase: "User not registered, starting with default token",
        locale: interaction.locale,
      }),
    });
  }

  let image = "https://i.imgur.com/2t1lL2U.png";
  if (options instanceof CommandInteractionOptionResolver) {
    image = options.getAttachment("image", true).url;
  }

  let asked = ia.postAsyncInterrogate(
    {
      source_image: image,
      forms: [
        {
          name: ModelInterrogationFormTypes.interrogation,
        },
        {
          name: ModelInterrogationFormTypes.caption,
        },
        {
          name: ModelInterrogationFormTypes.nsfw,
        },
      ],
    },
    {
      token: userToken,
    },
  );

  let DateStart = Date.now();

  asked
    .then((asked) => {
      i.edit({
        content: bt.__({
          phrase: "Request sent to the AI, please wait...",
          locale: interaction.locale,
        }),
      });
      let buttonCollector = i.createMessageComponentCollector({
        filter: (interactor) => {
          return (
            interactor.user.id === interaction.user.id &&
            interactor.customId === "cancel"
          );
        },
        max: 1,
      });
      const intervalCheck = setInterval(() => {
        ia.getInterrogationStatus(asked.id)
          .then((stat) => {
            if (stat.state && stat.state === HordeAsyncRequestStates.done) {
              let DateEnd = Date.now();
              clearInterval(intervalCheck);
              let embed = new EmbedBuilder();
              embed.setTitle(
                bt.__({
                  phrase: "Interrogation result",
                  locale: interaction.locale,
                }),
              );
              embed.setDescription(
                stat.forms
                  .flatMap((form) => {
                    if (form.result) {
                      return Object.entries(form.result).flatMap((type) => {
                        return `## ${type[0]}\n${
                          type[1] instanceof Object
                            ? Object.entries(type[1])
                                .map((value) => {
                                  return `**${value[0]}**: ${value[1]
                                    .map((value) => {
                                      return value.text;
                                    })
                                    .join(", ")}`;
                                })
                                .join("\n")
                            : type[1]
                        }`;
                      });
                    } else {
                      return [];
                    }
                  })
                  .join("\n"),
              );
              embed.setFooter({
                text: `Généré en ${Math.round((DateEnd - DateStart) / 1000)}s`,
              });
              i.edit({
                content: "",
                embeds: [embed],
                components: [],
              });
            } else {
              if (
                stat.state &&
                stat.state === HordeAsyncRequestStates.faulted
              ) {
                clearInterval(intervalCheck);
                ia.deleteInterrogationRequest(asked.id);
                i.edit({
                  content: bt.__({
                    phrase: "An error occured",
                    locale: interaction.locale,
                  }),
                });
              }
              let processed = stat.state
                ? bt.__(
                    {
                      phrase: "Request in process : %s",
                      locale: interaction.locale,
                    },
                    stat.state,
                  )
                : bt.__({
                    phrase: "Request waiting for processing",
                    locale: interaction.locale,
                  });
              i.edit({
                content: processed,
                components: [
                  new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                      .setCustomId("cancel")
                      .setLabel(
                        bt.__({
                          phrase: "Cancel",
                          locale: interaction.locale,
                        }),
                      )
                      .setStyle(ButtonStyle.Danger)
                      .setEmoji("🚫"),
                  ),
                ],
              });
            }
          })
          .catch((err) => {
            clearInterval(intervalCheck);
            ia.deleteInterrogationRequest(asked.id);
            i.edit({
              content: bt.__({
                phrase: "An error occured",
                locale: interaction.locale,
              }),
            });
          });
      }, 5000);

      buttonCollector.on("collect", (interactor) => {
        clearInterval(intervalCheck);
        ia.deleteInterrogationRequest(asked.id);
        interactor.update({
          content: bt.__({
            phrase: "Request canceled",
            locale: interaction.locale,
          }),
          components: [],
        });
      });
    })
    .catch((err) => {
      console.log(err);
      i.edit({
        content: bt.__({
          phrase: "An error occurred, request impossible",
          locale: interaction.locale,
        }),
      });
    });
}
