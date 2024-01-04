import {
  ApplicationCommand,
  AutocompleteInteraction,
  CacheType,
  CommandInteraction,
  Interaction,
  MessageContextMenuCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  UserContextMenuCommandInteraction,
} from "discord.js";
import Bot from "../index";

type Commande = RESTPostAPIApplicationCommandsJSONBody;
export default abstract class baseCommands {
  name: string;
  client: Bot;
  command: ApplicationCommand;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
  constructor(client: Bot, data: Commande, guildId?: string) {
    if (!guildId) {
      client.application?.commands
        .create(data)
        .then((cmd) => {
          console.log(`[command] ${data.name} created`);
          this.command = cmd;
        })
        .catch((err) => {
          console.log(`[command] ${data.name} not created`);
          console.log(err);
        });
    }

    this.name = data.name;
    this.client = client;
  }

  abstract run(interaction: CommandInteraction<CacheType>);
}
