import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fa" dir="rtl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="VortexAI - دستیار هوشمند تحلیل بازار کریپتوکارنسی" />
        <meta name="theme-color" content="#667eea" />
        
        {/* فونت Vazir برای پشتیبانی از فارسی */}
        <link 
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" 
          rel="stylesheet" 
        />
        
        {/* آیکون */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
