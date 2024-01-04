import {
  ActionRowBuilder,
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
import { GenerationInputKobold } from "../../../internal_libs/aihorde";
import { bt } from "../../../main";

export default async function Ask(
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
        phrase: "You must login to StableHorde",
        locale: interaction.locale,
      }),
    });
  }

  let question = "",
    temperature,
    topP,
    frequencyPenalty;
  if (options instanceof CommandInteractionOptionResolver) {
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
    },
  };
  if (topP) askData.params.top_p = topP;
  if (temperature) askData.params.temperature = temperature;
  if (frequencyPenalty) askData.params.rep_pen = frequencyPenalty;
  let asked = ia.postAsyncTextGenerate(askData, {
    token: userToken,
  });

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
        ia.getTextGenerationStatus(asked.id)
          .then((stat) => {
            if (stat.done) {
              let DateEnd = Date.now();
              clearInterval(intervalCheck);
              let embed = new EmbedBuilder();
              embed.setTitle(
                bt.__({ phrase: "AI Response", locale: interaction.locale }),
              );
              embed.setDescription(stat.generations[0].text);
              embed.setFooter({
                text: bt.__(
                  {
                    phrase: "Time elapsed: %s seconds",
                    locale: interaction.locale,
                  },
                  String((DateEnd - DateStart) / 1000),
                ),
              });
              i.edit({
                content: "",
                embeds: [embed],
                components: [],
              });
            } else {
              let wait_time = stat.wait_time || 1;
              let processed =
                bt.__({
                  phrase: "Request sent to the AI, please wait...",
                  locale: interaction.locale,
                }) + "\n";
              if (stat.queue_position && stat.queue_position > 0) {
                processed += bt.__(
                  {
                    phrase: "(Position in the queue: %s -",
                    locale: interaction.locale,
                  },
                  String(stat.queue_position),
                );
              }
              if (stat.waiting && stat.waiting > 0) {
                processed += ` En attente: ${stat.waiting})\n`;
                processed += bt.__(
                  { phrase: "Waiting : %s", locale: interaction.locale },
                  String(stat.waiting),
                );
              }
              if (stat.processing && stat.processing > 0) {
                processed += bt.__(
                  { phrase: "Processing : %s", locale: interaction.locale },
                  String(stat.processing),
                );
                processed += bt.__(
                  {
                    phrase: "(Estimated waiting time: <t:%s:R>)",
                    locale: interaction.locale,
                  },
                  String(
                    parseInt(
                      ((Date.now() + wait_time * 1000) / 1000).toString(),
                    ),
                  ),
                );
              }
              if (stat.kudos && stat.kudos > 0) {
                processed += bt.__(
                  { phrase: "Kudos used: %s", locale: interaction.locale },
                  String(stat.kudos),
                );
              }
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
            ia.deleteTextGenerationRequest(asked.id);
            i.edit({
              content: bt.__({
                phrase: "An error occurred, request impossible",
                locale: interaction.locale,
              }),
            });
          });
      }, 5000);

      buttonCollector.on("collect", (interactor) => {
        clearInterval(intervalCheck);
        ia.deleteTextGenerationRequest(asked.id);
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
