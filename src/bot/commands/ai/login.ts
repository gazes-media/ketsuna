import {
  ActionRowBuilder,
  CommandInteraction,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import CommandsBase from "../baseCommands";
import { bt } from "../../../main";
import { createUser } from "../../functions/database";

export default async function Login(
  command: CommandsBase,
  interaction: CommandInteraction,
) {
  let userDatabase = await command.client.database.users.findFirst({
    where: {
      id: interaction.user.id,
    },
  });
  let currentToken = "";
  if (userDatabase && userDatabase.horde_token) {
    currentToken = command.client.decryptString(userDatabase.horde_token);
  }
  interaction.showModal(
    new ModalBuilder()
      .setTitle(
        bt.__({ phrase: "Login to StableHorde", locale: interaction.locale }),
      )
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents([
          new TextInputBuilder()
            .setCustomId("token")
            .setPlaceholder(
              bt.__({
                phrase: "Token from stablehorde.net",
                locale: interaction.locale,
              }),
            )
            .setMaxLength(100)
            .setStyle(TextInputStyle.Short)
            .setValue(currentToken)
            .setRequired(true)
            .setLabel(
              bt.__({
                phrase: "Token from stablehorde.net",
                locale: interaction.locale,
              }),
            ),
        ]),
      )
      .setCustomId("login")
      .toJSON(),
  );

  let modal = await interaction.awaitModalSubmit({
    filter: (componentInteraction) => {
      return (
        componentInteraction.customId === "login" &&
        componentInteraction.user.id === interaction.user.id
      );
    },
    time: 1000 * 60 * 10,
    dispose: true,
  });

  let token = modal.fields.getTextInputValue("token");
  if (!token) {
    return;
  }

  if (modal.deferred) return;
  let modalInteraction = await modal.deferReply();
  let ai = command.client.aiHorde;
  try {
    let user = await ai.findUser({
      token,
    });
  } catch (e) {
    modalInteraction.edit({
      content: bt.__({ phrase: "Invalid token", locale: interaction.locale }),
    });
    return;
  }
  createUser({
    id: interaction.user.id,
    horde_token: command.client.encryptString(token),
  }, command.client.database).then(() => {
    modalInteraction.edit({
      content: bt.__({
        phrase: "You have been logged in",
        locale: interaction.locale,
      }),
    });
  }).catch((err) => {
    modalInteraction.edit({
      content: bt.__({
        phrase: "An error occured",
        locale: interaction.locale,
      }),
    });
  });
  return modalInteraction;
}
