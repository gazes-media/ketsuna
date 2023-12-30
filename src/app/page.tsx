"use client";
import ResponsiveAppBar from '../components/Appbar'
import { Link } from '@mui/material';

export default function Page() {
    return (
        <div style={{ overflowX: 'hidden' }}>
                <ResponsiveAppBar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '100vh', minHeight: "90vh" }}>
                    <Link href="https://discord.com/api/oauth2/authorize?client_id=1100859965616427068&permissions=418829953344&scope=bot+applications.commands" style={{ color: 'white', textDecoration: 'none' }}>
                        <h2 style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.3rem' }}>Invite the bot to your server</h2>
                    </Link>
                </div>
        </div>
    );
}
