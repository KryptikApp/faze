import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { load, trackPageview } from "fathom-client";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import { useEffect } from "react";

// Record a pageview when route changes
Router.events.on("routeChangeComplete", (as, routeProps) => {
  if (!routeProps.shallow) {
    trackPageview();
  }
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // load fathom
    load("UECUDUKZ", {
      includedDomains: ["faze.kryptik.app"],
    });
  }, []);
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
