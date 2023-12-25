import Link from 'next/link'
import NextHead from 'next/head'
export default function Home() {
    return (
        <div>
            <NextHead>
                <title>Salut</title>
                <meta name="description" content="Home" />
            </NextHead>
            <ul>
                <li>
                    <Link href="/a" as="/a">
                        a
                    </Link>
                </li>
                <li>
                    <Link href="/b" as="/b">
                        b
                    </Link>
                </li>
            </ul>
        </div>
    )
}