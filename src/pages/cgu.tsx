import NextHead from 'next/head'
import Theme from '../components/theme';
import ButtonAppBar from '../components/Appbar';
import { Container } from '@mui/material';

export default function Home() {
    return (
        <Theme>
            <NextHead>
                <title>Conditions d'utilisation du bot Discord Ketsuna</title>
            </NextHead>
            <ButtonAppBar />
            <Container maxWidth="md">
                <ol>
                    <li>
                        <h3>Acceptation des conditions d'utilisation</h3>
                        En utilisant le bot Discord Ketsuna, vous acceptez sans réserve les présentes conditions d'utilisation. Si vous n'êtes pas d'accord avec l'une des dispositions énoncées ici, veuillez cesser d'utiliser le bot immédiatement.
                    </li>
                    <li><h3>Collecte de données</h3>
                        Ketsuna s'engage à ne collecter aucune donnée personnelle des utilisateurs. Nous ne sauvegardons, n'enregistrons ni ne stockons aucune information personnelle identifiable. Toutes les interactions avec le bot sont anonymes.
                    </li>
                    <li><h3>Utilisation appropriée</h3>
                        Les utilisateurs sont tenus de respecter les règles de conduite appropriées lorsqu'ils interagissent avec Ketsuna. Cela inclut, mais sans s'y limiter, l'absence de contenu offensant, abusif, discriminatoire, illégal, ou contraire aux directives de Discord. Nous nous réservons le droit de bloquer l'accès à notre bot à tout utilisateur ne respectant pas ces règles.
                    </li>
                    <li><h3>Responsabilité</h3>
                        Ketsuna est fourni "tel quel" sans aucune garantie, expresse ou implicite. En aucun cas, les développeurs de Ketsuna ne pourront être tenus responsables des dommages directs, indirects, accidentels, spéciaux, exemplaires ou consécutifs découlant de l'utilisation ou de l'impossibilité d'utiliser ce bot.
                    </li>
                    <li><h3>Modifications</h3>
                        Les développeurs de Ketsuna se réservent le droit de modifier les conditions d'utilisation à tout moment. Les utilisateurs seront informés des changements via les canaux appropriés de Discord. Il incombe aux utilisateurs de consulter régulièrement les conditions d'utilisation pour être au courant de toute mise à jour.
                    </li>
                    <li><h3>Contact</h3>
                        Pour toute question, préoccupation ou rapport de violation des conditions d'utilisation, veuillez nous contacter par email à contact@jeremysoler.com ou en rejoignant <a href="https://discord.gg/d7QvY6TwwN">Le serveur support</a>.
                    </li>
                </ol>
                <p>En utilisant Ketsuna, vous confirmez que vous avez lu et compris ces conditions d'utilisation et que vous vous engagez à les respecter.</p>
                <p>Date d'entrée en vigueur des conditions d'utilisation : 28/07/2023</p>
            </Container>
        </Theme>
    );
}
