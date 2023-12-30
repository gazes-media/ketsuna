"use client";

import { ExpandMore, Numbers} from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Chip, Container, Divider, List, ListItem, ListSubheader, Typography } from "@mui/material";
import type { APIApplicationCommand, APIApplicationCommandSubcommandGroupOption, APIApplicationCommandSubcommandOption } from "discord.js";
import React from "react";


export default function Commands({ commands }: { commands: APIApplicationCommand[] }) {
    return (
        <Container maxWidth="lg">
            {commands.map((command) => (
                <CommandComponent command={command} key={command.id} />
            ))}
        </Container>
    );
}

export function CommandComponent({ command }: { command: APIApplicationCommand }) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontSize={20} sx={{ fontWeight: 'bold', fontSize: '1.2rem', width: "50%" }}>
                    <Numbers /> /{command.name}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{command.description}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List>
                    {command.options && command.options.map((option, index) => (
                        <div>
                            <Option name={option.name} description={option.description}>
                                {option.type === 1 ?
                                    <SubCommand subcommand={option} />
                                    : option.type === 2
                                        ? <SubCommandGroup subcommandgroup={option} /> : (
                                            <Chip size="small" label={option.required ? "Requis" : "Optionnel"} color={option.required ? "error" : "success"} />
                                        )}
                            </Option>
                            <Divider />
                        </div>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion>
    );
}

function SubCommand({ subcommand }: { subcommand: APIApplicationCommandSubcommandOption }) {
    return (
        <ListItem>
            {subcommand.options && (
            <List>
                <ListSubheader sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    Options de {subcommand.name}
                </ListSubheader>
                {subcommand.options && subcommand.options.map((suboption, index) => (
                    <ListItem key={index}>
                        <div>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                {suboption.name}
                            </Typography>
                            <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                {suboption.description} - <Chip size="small" label={suboption.required ? "Requis" : "Optionnel"} color={suboption.required ? "error" : "success"} />
                            </Typography>
                        </div>
                        
                    </ListItem>
                ))}
            </List>
            )}
        </ListItem>
    );
}

function SubCommandGroup({ subcommandgroup }: { subcommandgroup: APIApplicationCommandSubcommandGroupOption }) {
    return (
        <div>
            {subcommandgroup.options && subcommandgroup.options.map((suboption, index) => (
                <ListItem key={index}>
                    <div>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                            {suboption.name}
                        </Typography>
                        <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            {suboption.description}
                        </Typography>
                    </div>
                    <SubCommand subcommand={suboption} />
                </ListItem>
            ))}
        </div>
    );
}

function Option({ name, description, children }: { name: string, description: string, children: React.ReactNode }) {
    return (
        <div>
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {name}
            </Typography>
            <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                {description}
            </Typography>
            {children}
        </div>
    );
}