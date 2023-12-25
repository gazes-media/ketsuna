"use strict";
import NextHead from 'next/head'
import Theme from '../components/theme';
import ButtonAppBar from '../components/Appbar';
import { Link } from '@mui/material';

export default function Home() {
    return (
        <div style={{ overflowX: 'hidden' }}>
            <Theme>
                <NextHead>
                    <title>Ketsuna - Discord Bot</title>
                    <meta name="description" content="Ketsuna the discord bot" />
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    <meta name="theme-color" content="#000000" />
                    <meta name="author" content="Garder500" />
                    <meta name="og:title" content="Ketsuna - Discord Bot" />
                    <meta name="og:description" content="Ketsuna the discord bot" />
                    <meta name="og:type" content="website" />
                    <meta name="og:url" content="https://ketsuna.com" />
                    <meta name="og:site_name" content="Ketsuna" />
                </NextHead>
                <ButtonAppBar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '100vh', minHeight: "90vh" }}>
                    <Link href="https://discord.com/api/oauth2/authorize?client_id=1100859965616427068&permissions=418829953344&scope=bot+applications.commands" style={{ color: 'white', textDecoration: 'none' }}>
                        <h2 style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.3rem' }}>Invite the bot to your server</h2>
                    </Link>
                </div>
            </Theme>
        </div>
    );
}
