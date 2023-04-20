import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as face from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";
import { drawMesh } from "@/utils/drawMesh";

/**
 * @interface IBoundingBox
 * @description Interface for the bounding box of a face
 * @property {number} tlX - The top left x coordinate of the bounding box
 * @property {number} tlY - The top left y coordinate of the bounding box
 * @property {number} brX - The bottom right x coordinate of the bounding box
 * @property {number} brY - The bottom right y coordinate of the bounding box
 */
interface IBoundingBox {
  tlX: number;
  tlY: number;
  brX: number;
  brY: number;
}

const idealFaceBox: IBoundingBox = {
  tlX: 200,
  tlY: 100,
  brX: 500,
  brY: 400,
};

export default function Scanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef(null);
  const distRef = useRef<number>(0);
  const [distFromCamera, setDistFromCamera] = useState<number>(0);
  const [boundingBox, setBoundingBox] = useState<IBoundingBox | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetFaceBox, setTargetFaceBox] =
    useState<IBoundingBox>(idealFaceBox);

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
        face[0].annotations.noseTip[0] &&
        face[0].boundingBox
      ) {
        const nose = face[0].annotations.noseTip[0][2];
        const newBoundingBox: IBoundingBox = {
          tlX: face[0].boundingBox.topLeft[0],
          tlY: face[0].boundingBox.topLeft[1],
          brX: face[0].boundingBox.bottomRight[0],
          brY: face[0].boundingBox.bottomRight[1],
        };
        // const width = newBoundingBox.brX - newBoundingBox.tlX;
        // const height = newBoundingBox.brY - newBoundingBox.tlY;
        // if (canvasRef.current) {
        //   canvasRef.current.width = videoWidth;
        //   canvasRef.current.height = videoHeight;
        //   const ctx = canvasRef.current.getContext(
        //     "2d"
        //   ) as CanvasRenderingContext2D;
        //   // requestAnimationFrame(() => {
        //   //   ctx.beginPath();
        //   //   ctx.lineWidth = "4";
        //   //   ctx.strokeStyle = "red";
        //   //   ctx.rect(newBoundingBox.tlX, newBoundingBox.tlY, width, height);
        //   //   ctx.stroke();
        //   // });
        // }
        setBoundingBox(newBoundingBox);
        setDistFromCamera(nose);
      }

      return face;
    } else {
      return null;
    }
  }

  function initFaceAssist() {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video !== null &&
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current
    ) {
      setIsLoading(true);
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = video.offsetWidth;
      const videoHeight = video.offsetHeight;
      console.log(videoWidth, videoHeight);
      // Set video/canvas width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const ctx = canvasRef.current.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      ctx.beginPath();
      ctx.lineWidth = "4";
      ctx.strokeStyle = "green";
      const width = targetFaceBox.brX - idealFaceBox.tlX;
      const height = targetFaceBox.brY - idealFaceBox.tlY;
      ctx.rect(
        videoWidth / 4,
        videoHeight / 4,
        videoWidth / 2,
        videoHeight / 2
      );
      ctx.stroke();
      console.log("face assist initialized");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (window.navigator !== undefined) {
      initFaceDetection();
    }
    // Handler to call on window resize
    function handleResize() {
      if (window.innerWidth < 778) {
        initFaceAssist();
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    initFaceAssist();
  }, [webcamRef.current]);

  return (
    <div className="bg-yellow-500">
      <Webcam
        ref={webcamRef}
        className={`rounded-xl ${isLoading && "invisible"} px-2`}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 200,
          left: 0,
          right: 0,
          zIndex: 9,
        }}
      />
      <canvas
        ref={canvasRef}
        className={`rounded-xl ${isLoading && "invisible"} px-2`}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 200,
          left: 0,
          right: 0,
          zIndex: 9,
        }}
      />
      <div
        className={`${
          !isLoading && "hidden"
        } bg-gray-500 w-[600px] h-[400px] rounded-xl max-w-xl animate-pulse px-2`}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 205,
          left: 0,
          right: 0,
          zIndex: 9,
        }}
      ></div>
      <p className="text-sky-400 px-2">{distFromCamera.toFixed(2)}</p>
    </div>
  );
}
