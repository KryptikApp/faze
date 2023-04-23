import Image from "next/image";
import dynamic from "next/dynamic";

const DynamicHeader = dynamic(() => import("../components/scan/Scanner"), {
  ssr: false,
  loading: () => <p className="text-center">Loading...</p>,
});

export default function Home() {
  return (
    <div className="max-w-2xl min-h-[40vh] mx-auto mt-[12vh] rounded-xl">
      {/* <DynamicHeader /> */}
      <Image
        width={400}
        height={400}
        src={"/demos/assistDemo.gif"}
        alt={"Demo of face assist."}
        className="mx-auto rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
      />
      <div className="text-center my-10 group">
        <h1 className="text-7xl md:text-8xl lg:text-9xl text-center mb-2 group-hover:scale-105 transition-transform duration-300">
          FAZE ID
        </h1>
        <p className="text-center text-xl md:text-3xl lg:text-2xl group-hover:scale-105 transition-transform duration-300">
          Privacy preserving face authentication on the browser.
        </p>
      </div>
      <div className="hover:scale-105 transition-transform duration-300">
        <div className="border border-gray-400 dark:border-gray-600 rounded-tr-xl rounded-tl-xl p-2 bg-gray-100/10">
          <h2 className="text-2xl ">About</h2>
        </div>
        <div className="rounded-br-xl rounded-bl-xl border-gray-400 dark:border-gray-600 border-r border-l border-b p-2 grid grid-cols-1 divide-y">
          <div className="group">
            <h1 className="text-2xl group-hover:text-green-400 transition-color duration-500">
              Face Assist
            </h1>
            <p>Face assist helps orient the user to capture the best shot.</p>
          </div>
          <div className="group">
            <h1 className="text-2xl group-hover:text-green-400 transition-color duration-500">
              Local Hashing
            </h1>
            <p>
              All biometric data is hashed on the client to preserve privacy.
            </p>
          </div>
          <div className="group">
            <h1 className="text-2xl group-hover:text-green-400 transition-color duration-500">
              Nearest Neighbor Search
            </h1>
            <p>
              Similar scans are hashed to the same value. Search takes constant
              time.
            </p>
          </div>
          <div className="group">
            <h1 className="text-2xl group-hover:text-green-400 transition-color duration-500">
              Liveness Detection
            </h1>
            <p>
              Challenges are issued to ensure the user is real and attentive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
