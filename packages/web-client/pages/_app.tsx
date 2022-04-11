import * as React from 'react';
import type { AppProps } from 'next/app';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import useDarkMode from 'use-dark-mode';
import NoSSR from 'react-no-ssr';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import createEmotionCache from '../utility/createEmotionCache';
import lightThemeOptions from '../styles/theme/lightThemeOptions';
import darkThemeOptions from '../styles/theme/darkThemeOptions';
import '../styles/globals.css';
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const clientSideEmotionCache = createEmotionCache();

const lightTheme = createTheme(lightThemeOptions);
const darkTheme = createTheme(darkThemeOptions);

const MyApp: React.FunctionComponent<MyAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const { value: isDark } = useDarkMode(true);
  const themeConfig = isDark ? darkTheme : lightTheme;

  return (
    <NoSSR>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={themeConfig}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </NoSSR>
  );
};

export default MyApp;