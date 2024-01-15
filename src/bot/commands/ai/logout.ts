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
import { removeToken } from "../../functions/database";

export default async function Logout(
  command: CommandsBase,
  interaction: CommandInteraction,
) {
  try {
    let userDatabase = removeToken(interaction.user.id, command.client.database);
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
