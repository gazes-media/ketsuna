import { AutocompleteInteraction, CommandInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import Bot from "../index";

type Commande = RESTPostAPIApplicationCommandsJSONBody;
export default abstract class CommandsBase {
    name: string;
    client: Bot;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>
    constructor(client: Bot, data: Commande, guildId?: string) {
        if (guildId) {
            client.application?.commands.create(data, guildId).then((cmd) => {
                console.log(`[command] ${data.name} created`);	
            }).catch((err) => {
                console.log(`[command] ${data.name} not created`);
                console.log(err);
            });
        } else {
            client.application?.commands.create(data).then((cmd) => {
                console.log(`[command] ${data.name} created`);
            }).catch((err) => {
                console.log(`[command] ${data.name} not created`);
                console.log(err);
            });
        }

        this.name = data.name;
        this.client = client;
    }

    abstract run(interaction: CommandInteraction): Promise<void>;
}