import type { Metadata } from "next";
import CommandsAccordeon from "./CommandComponent";
import type { APIApplicationCommand, APIUser } from "discord.js";
import ResponsiveAppBar from "../../components/Appbar";

export const metadata: Metadata = {
    title: "Commandes",
    description: "Liste des commandes du bot Discord Ketsuna",
    openGraph: {
        title: "Commandes",
        description: "Liste des commandes du bot Discord Ketsuna",
    },
};

async function getData() {
        // get Current Application ID
        let userRes = await fetch("https://discord.com/api/v10/users/@me", {
            headers: {
                "Authorization": `Bot ${process.env.DISCORD_TOKEN}`
            }
        });
        let user = await userRes.json() as APIUser;
        let res = await fetch("https://discord.com/api/v10/applications/" + user.id + "/commands", {
            headers: {
                "Authorization": `Bot ${process.env.DISCORD_TOKEN}`
            }
        });
        let commands: APIApplicationCommand[] = await res.json();
        return commands;
  }

export default async function Page() {
    let datas = await getData()
    return (
        <div>
            <ResponsiveAppBar />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <h1 style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.3rem' }}>Liste des commandes</h1>
            </div>
            <CommandsAccordeon commands={datas} />
        </div>
    );
}