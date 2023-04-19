import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import Navbar from "./navbars/Navbar";

// TODO: Update to support dynamic headers
export default function Layout({ children }: any) {
  const router = useRouter();
  return (
    <div className={`min-h-screen pb-20 bg-white dark:bg-black px-4`}>
      <Head>
        <title>No Parking Players</title>
        <meta
          name="description"
          content="The No Parking Players are Carnegie Mellon University's premier improv comedy troupe. We perform monthly shows at the University Center and host improv workshops and classes for students of all skill levels."
        />
        <link rel="icon" href="/brand/logoLight.webp" />
      </Head>

      <main className={``}>
        <Toaster />
        <Navbar />
        <div className="h-20" />
        {children}
      </main>
    </div>
  );
}
