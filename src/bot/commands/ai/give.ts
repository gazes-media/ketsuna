import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  User,
} from "discord.js";
import CommandsBase from "../baseCommands";
import { bt } from "../../../main";
import { getUser } from "../../functions/database";

export default async function Give(
  command: CommandsBase,
  interaction: CommandInteraction,
) {
  let i = await interaction.deferReply();
  let options = interaction.options;
  let userSelected: User;
  let amount = 1;
  if (options instanceof CommandInteractionOptionResolver) {
    userSelected = options.getUser("user");
    amount = options.getNumber("amount") || 1;
  }
  if(!userSelected) return i.edit({
    content: bt.__({
      phrase: "You must select a user",
      locale: interaction.locale,
    }),
  });

  if(userSelected.id === interaction.user.id) return i.edit({
    content: bt.__({
      phrase: "You can't give kudos to yourself",
      locale: interaction.locale,
    }),
  });
  i.edit({
    content: bt.__({
      phrase: "Searching for the user in the database",
      locale: interaction.locale,
    }),
  });
  let giverUser = await getUser(interaction.user.id, command.client.database);
  if (!giverUser)
    return i.edit({
      content: bt.__(
        {
          phrase: "You must login to StableHorde using %s",
          locale: interaction.locale,
        },
        `</${interaction.commandName} login:${interaction.commandId}>`,
      ),
    });
  i.edit({
    content: bt.__({
      phrase: "Searching for the user in the API",
      locale: interaction.locale,
    }),
  });
  if(!giverUser.horde_token) return i.edit({
    content: bt.__({
      phrase: "You must login to StableHorde using %s",
      locale: interaction.locale,
    }),
  });
  let token = command.client.decryptString(giverUser.horde_token);
  let ai = command.client.aiHorde;
  try {
    let user = await ai.findUser({
      token,
    });
    if (user.kudos < amount)
      return i.edit({
        content: bt.__({
          phrase: "You don't have enough kudos",
          locale: interaction.locale,
        }),
      });
    // find the other user
    let receiverUser = await getUser(userSelected.id, command.client.database);
    if (!receiverUser.horde_token)
      return i.edit({
        content: bt.__({
          phrase: "The user is not registered",
          locale: interaction.locale,
        }),
      });
    try {
      let receiverToken = command.client.decryptString(
        receiverUser.horde_token,
      );
      let receiver = await ai.findUser({
        token: receiverToken,
      });
      // give kudos

      ai.postKudosTransfer(
        {
          username: receiver.username,
          amount,
        },
        {
          token: token,
        },
      )
        .then(async (content) => {
          i.edit({
            content: bt.__(
              {
                phrase: "You have given %s kudos to %s",
                locale: interaction.locale,
              },
              String(content.transferred),
              `<@${userSelected.id}> (${receiver.username})`,
            ),
          });
        })
        .catch(async (err) => {
          i.edit({
            content: bt.__({
              phrase: "An error occured",
              locale: interaction.locale,
            }),
          });
        });
    } catch (e) {
      return i.edit({
        content: bt.__({
          phrase: "The user is not registered",
          locale: interaction.locale,
        }),
      });
    }
  } catch (e) {
    return i.edit({
      content: bt.__(
        {
          phrase: "Token invalid, you must login to StableHorde using %s",
          locale: interaction.locale,
        },
        `</${interaction.commandName} login:${interaction.commandId}>`,
      ),
    });
  }
}

function Capitalize(str: string) {
  return `**${str.charAt(0).toUpperCase() + str.slice(1)}**`;
}
