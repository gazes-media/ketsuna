import NextHead from 'next/head'
import Theme from '../components/theme';
import ButtonAppBar from '../components/Appbar';

export default function Home() {
  return (
    <Theme>
        <NextHead>
            <title>Dark Mode</title>
        </NextHead>
      <ButtonAppBar />
    </Theme>
  );
}
