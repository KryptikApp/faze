import * as face from "@tensorflow-models/face-landmarks-detection";
import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";

const DynamicHeader = dynamic(() => import("../components/scan/Scanner"), {
  ssr: false,
  loading: () => <p className="text-center">Loading...</p>,
});

export default function Home() {
  return (
    <div className="w-full min-h-[40vh] mx-auto mt-[22vh]">
      <DynamicHeader />
    </div>
  );
}
