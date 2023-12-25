import Link from "next/link";
import { Link as MuiLink } from "@mui/material";
import React from "react";
export default function LinkComponent({ to, props, children }: { to: string, props?: any, children: React.ReactNode }) {
    return (
        <MuiLink underline="none" {...props}>
            <Link href={to} style={{ color: 'white', textDecoration: 'none' }}>
                {children}
            </Link>
        </MuiLink>
    )
}