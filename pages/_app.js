import Head from "next/head";
import Layout from "../componets/Layout";
import MenuScroll from "../componets/MenuScroll";
import "../assets/styles/css/globals.css";
import React from "react";
export default function App({ Component, pageProps }) {
  return (
    <React.StrictMode>
      <MenuScroll />
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </React.StrictMode>
  );
}
