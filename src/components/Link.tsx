import Link from "next/link";
import React from "react";
export default function LinkComponent({ to, props, children }: { to: string, props?: any, children: React.ReactNode }) {
    return (
        <Link {...props} href={to} style={{ color: 'white', textDecoration: 'none' }}>
                {children}
        </Link>
    )
}