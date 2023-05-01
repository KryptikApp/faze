import Image from "next/image";
import dynamic from "next/dynamic";
import { PopSquare } from "@/components/PopSquare";

const DynamicHeader = dynamic(() => import("../components/scan/Scanner"), {
  ssr: false,
  loading: () => <p className="text-center">Loading...</p>,
});

export default function Home() {
  return (
    <div className="max-w-2xl min-h-[40vh] mx-auto mt-[12vh] rounded-xl">
      <div className="h-[20vh]" />
      <div className="sticky top-2 bg-gradient-to-r from-green-500/90 via-sky-500/90 to-green-400/90 border-green-700 w-full rounded-xl p-2 text-center my-8 z-10">
        <h1 className="text-3xl md:text-7xl font-bold">FAZE ID</h1>
        <p className="text-lg md:text-2xl ">The what and why.</p>
      </div>
      <div className="h-[50vh]" />
      <p className="text-3xl mb-20">
        FAZE ID is designed to be a fast and simple way to authenticate users.
      </p>
      <PopSquare>
        <div className="flex flex-col md:flex-row spac-x-4">
          <Image
            width={400}
            height={400}
            src={"/demos/assistDemo.gif"}
            alt={"Demo of face assist."}
            className="mx-auto rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
          />
          <div className="mt-2 md:pl-2 md:mt-0">
            <h1 className="text-3xl group-hover:text-green-400 transition-color duration-500">
              Face Assist
            </h1>
            <p>Face assist helps orient the user to capture the best shot.</p>
          </div>
        </div>
      </PopSquare>
    </div>
  );
}
