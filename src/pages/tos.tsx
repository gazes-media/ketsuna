import NextHead from 'next/head'
import Theme from '../components/theme';
import ButtonAppBar from '../components/Appbar';
import { Container } from '@mui/material';

export default function Home() {
    return (
        <Theme>
            <NextHead>
                <title>Politique de confidentialité du bot Discord Ketsuna</title>
            </NextHead>
            <ButtonAppBar />
            <Container maxWidth="md">
                <p>
                    La présente Politique de confidentialité régit la manière dont Ketsuna collecte, utilise, traite et protège les informations personnelles des utilisateurs lorsqu'ils interagissent avec le bot Discord Ketsuna.
                </p>
                <h2>Collecte de données</h2>
                <p>
                    Ketsuna s'engage à ne collecter aucune donnée personnelle des utilisateurs. Nous ne sauvegardons, n'enregistrons ni ne stockons aucune information personnelle identifiable. Toutes les interactions avec le bot sont anonymes.
                </p>
                <h2>Utilisation des données</h2>
                <p>
                    Comme mentionné précédemment, Ketsuna ne collecte aucune donnée personnelle des utilisateurs. Par conséquent, aucune donnée personnelle n'est utilisée, traitée ou partagée avec des tiers.
                </p>
                <h2>Cookies</h2>
                <p>
                    Ketsuna n'utilise pas de cookies pour collecter des informations personnelles.
                </p>
                <h2>Sécurité</h2>
                <p>
                    La sécurité des informations des utilisateurs est importante pour nous. Cependant, comme nous ne collectons pas de données personnelles, il n'y a pas d'informations sensibles à protéger.
                </p>
                <h2>Modifications de la politique de confidentialité</h2>
                <p>
                    Les développeurs de Ketsuna se réservent le droit de modifier la politique de confidentialité à tout moment. Les utilisateurs seront informés des changements via les canaux appropriés de Discord.
                </p>
                <h2>Contact</h2>
                <p>
                    Pour toute question ou préoccupation concernant la politique de confidentialité de Ketsuna, veuillez nous contacter par email à contact@jeremysoler.com ou en rejoignant <a href="https://discord.gg/d7QvY6TwwN">Le serveur support</a>.
                </p>
                <p>Version actuelle de la politique de confidentialité : 28/07/2023</p>
            </Container>
        </Theme>
    );
}
