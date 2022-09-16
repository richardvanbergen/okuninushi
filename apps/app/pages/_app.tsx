import type { AppProps } from 'next/app'
import '../src/main.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
