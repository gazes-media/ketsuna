"use client";

import { Card, Container, Divider, Typography } from "@mui/material";
import { type APIApplicationCommand, type APIApplicationCommandSubcommandOption } from "discord.js";
import React from "react";


export default function Commands({ commands }: { commands: APIApplicationCommand[] }) {
    return (
        <Container maxWidth="lg">
            {commands.map((command, index) => (
                <CommandComponent command={command} key={index} />
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
                Définitions des options de commandes
            </Typography>
            <div style={{ marginLeft: "1rem", marginBottom: "1rem", display: "flex", flexDirection: "row" }}>
                <Typography color={"red"} variant="body1" gutterBottom style={{
                    marginRight: "0.5rem",
                }}>*</Typography> Option requise
            </div>
        </Container>
    );
}

export function CommandComponent({ command }: { command: APIApplicationCommand }) {
    return command.options ? command.options[0].type === 1 ? command.options.map((option, index) => (
                option.type === 1 ? <SubComponentCard subcommand={option} baseCommand={command.name} key={index} /> : <div></div>
            )) : (command.options.find(e => e.type === 2) ? command.options.map((option, index) => (
                option.type === 2 ? option.options.map((suboption, key) => (
                    <SubGroupComponentCard subcommand={suboption} baseCommand={command.name} baseGroup={option.name} key={key} />
                )) : <div key={index}></div> )) : <CommandComponentCard command={command} />) : <CommandComponentCard command={command} />
}

function SubComponentCard({ subcommand, baseCommand}: { subcommand: APIApplicationCommandSubcommandOption, baseCommand: string }) {
    return (
        <Card style={{ backgroundColor:"#111827", borderRadius: 20, padding:20, marginBottom:20 }}>
            <div style={{ marginLeft: "1rem" }}>
            <Typography variant="h5" gutterBottom>
                /{baseCommand} {subcommand.name} {subcommand.options?.map((suboption,index) => (
                    <code style={{
                        backgroundColor: "#09090b",
                        marginLeft: "0.5rem",
                    }} key={index}>{suboption.name}</code> 
                ))}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {subcommand.description}
            </Typography>
            <div style={{ marginLeft: "1rem" }}>
                    {subcommand.options?.map((suboption, index) => (
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                            }} key={index}><code style={{
                                backgroundColor: "#09090b",
                                marginRight: "0.5rem",
                            }}>{suboption.name}</code> {suboption.required && <Typography color="red" style={{
                                marginRight: "0.5rem",
                            }}> * </Typography>}{suboption.description}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

function SubGroupComponentCard({ subcommand, baseCommand, baseGroup }: { subcommand: APIApplicationCommandSubcommandOption, baseCommand: string, baseGroup: string }) {
    return (
        <Card style={{ backgroundColor:"#111827", borderRadius: 20, padding:20, marginBottom:20 }}>
            <div style={{ marginLeft: "1rem" }}>
            <Typography variant="h5" gutterBottom>
                /{baseCommand} {baseGroup} {subcommand.name} {subcommand.options?.map((suboption, index) => (
                    <code key={index} style={{
                        backgroundColor: "#0a0a0a",
                        marginLeft: "0.5rem",
                    }}>{suboption.name}</code> 
                ))}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {subcommand.description}
            </Typography>
            <div style={{ marginLeft: "1rem" }}>
                    {subcommand.options?.map((suboption, index) => (
                             <div style={{
                                display: "flex",
                                flexDirection: "row",
                            }} key={index}><code style={{
                                backgroundColor: "#09090b",
                                marginRight: "0.5rem",
                            }}>{suboption.name}</code> {suboption.required && <Typography color="red" style={{
                                marginRight: "0.5rem",
                            }}> * </Typography>}{suboption.description}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

function CommandComponentCard({ command }: { command: APIApplicationCommand }) {
    return (
        <Card style={{ backgroundColor:"#111827", borderRadius: 20, padding:20, marginBottom:20 }}>
            <div style={{ marginLeft: "1rem" }}>
            <Typography variant="h5" gutterBottom>
                /{command.name} {command.options?.map((option, key) => (
                    <code style={{
                        backgroundColor: "#0a0a0a",
                        marginLeft: "0.5rem",
                    }} key={key}>{option.name}</code> 
                ))}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {command.description}
            </Typography>
            <div style={{ marginLeft: "1rem" }}>
                    {command.options?.map((suboption, index) => (
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                            }} key={index}><code style={{
                                backgroundColor: "#09090b",
                                marginRight: "0.5rem",
                            }}>{suboption.name}</code> {suboption.required && <Typography color="red" style={{
                                marginRight: "0.5rem",
                            }}> * </Typography>}{suboption.description}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}
