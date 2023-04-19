import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as face from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";
import { drawMesh } from "@/utils/drawMesh";

export default function Scanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef(null);
  const distRef = useRef<number>(0);
  const [distFromCamera, setDistFromCamera] = useState<number>(0);

  function updateDistFromCamera(rawVal: number) {
    setDistFromCamera(rawVal);
  }

  async function initFaceDetection() {
    const detector: MediaPipeFaceMesh = await face.load(
      face.SupportedPackages.mediapipeFacemesh
    );
    setInterval(() => {
      detect(detector);
    }, 100);
  }

  async function detect(net: MediaPipeFaceMesh) {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      const face = await net.estimateFaces({ input: video });
      if (
        face &&
        face[0] &&
        face[0].annotations &&
        face[0].annotations.noseTip &&
        face[0].annotations.noseTip[0]
      ) {
        const nose = face[0].annotations.noseTip[0][2];
        setDistFromCamera(nose);
      }
      console.log(face);
      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        const ctx = canvasRef.current.getContext(
          "2d"
        ) as CanvasRenderingContext2D;
        requestAnimationFrame(() => {
          drawMesh(face, ctx);
        });
      }
      return face;
    } else {
      return null;
    }
  }
  useEffect(() => {
    if (window.navigator !== undefined) {
      initFaceDetection();
    }
  }, [window]);

  return (
    <div className="max-w-xl mx-auto px-2">
      <Webcam ref={webcamRef} className="absolute t-0 l-0 rounded-xl" />
      <canvas ref={canvasRef} className="absolute t-0 l-0 rounded-xl" />
      <p className="text-sky-400 px-2">{distFromCamera.toFixed(2)}</p>
    </div>
  );
}
