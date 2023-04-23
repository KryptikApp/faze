import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import Navbar from "./navbars/Navbar";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

// TODO: Update to support dynamic headers
export default function Layout({ children }: any) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (window && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      console.log("Dark mode detected");
      setIsDark(true);
    }
  }, []);

  return (
    <div className={`min-h-screen pb-20 ${isDark && "dark"} px-4`}>
      <Head>
        <title>Faze ID</title>
        <meta
          name="description"
          content="Privacy preserving face authentication on the browser."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@kryptikApp" />
        <meta name="twitter:title" content="Faze ID" />
        <meta
          name="twitter:description"
          content="Privacy preserving face authentication on the browser."
        />
        <meta name="twitter:image" content="/fazeLogo.png" />
        <link rel="icon" href="/fazeLogo.png" />
      </Head>
      {/* add custom font */}
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <main className={``}>
        <Toaster position="top-left" />
        <Navbar />
        <div className="h-20" />
        {children}
      </main>
    </div>
  );
}
