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

export default async function Logout(
  command: CommandsBase,
  interaction: CommandInteraction,
) {
  try {
    let userDatabase = await command.client.database.users.delete({
      where: {
        id: interaction.user.id,
      },
    });
    if (userDatabase) {
      interaction.reply({
        content: bt.__({
          phrase: "You have been logged out",
          locale: interaction.locale,
        }),
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (err) {
    interaction.reply({
      content: bt.__({
        phrase: "You were not logged in",
        locale: interaction.locale,
      }),
      flags: MessageFlags.Ephemeral,
    });
  }
}
