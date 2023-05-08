import Layout from "@/components/Layout";
import "highlight.js/styles/github-dark-dimmed.css";
import hljs from "highlight.js";
import typescript from "highlight.js/lib/languages/typescript";
hljs.registerLanguage("typescript", typescript);
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
    // init highlight.js
    hljs.initHighlightingOnLoad();
  }, []);
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
