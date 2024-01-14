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
  if (userDatabase) {
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
    return modal.reply({
      content: bt.__({
        phrase: "You must enter a token",
        locale: interaction.locale,
      }),
      flags: MessageFlags.Ephemeral,
    });
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
  if (userDatabase) { 
    command.client.database.users
      .update({
        where: {
          id: interaction.user.id,
        },
        data: {
          horde_token: command.client.encryptString(token),
        },
      })
      .then(() => {
        modalInteraction.edit({
          content: bt.__({
            phrase: "Token updated",
            locale: interaction.locale,
          }),
        });
      })
      .catch((err) => {
        modalInteraction.edit({
          content: bt.__({
            phrase: "An error occurred",
            locale: interaction.locale,
          }),
        });
      });
  } else {
    command.client.database.users
      .create({
        data: {
          id: interaction.user.id,
          horde_token: command.client.encryptString(token),
        },
      })
      .then(() => {
        modalInteraction.edit({
          content: bt.__({ phrase: "Token added", locale: interaction.locale }),
        });
      })
      .catch((err) => {
        modalInteraction.edit({
          content: bt.__({
            phrase: "An error occurred",
            locale: interaction.locale,
          }),
        });
      });
  }
  return modalInteraction;
}
