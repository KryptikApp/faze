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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefFace = useRef<HTMLCanvasElement>(null);
  const distRef = useRef<number>(0);
  const [distFromCamera, setDistFromCamera] = useState<number>(0);
  const [boundingBox, setBoundingBox] = useState<IBoundingBox | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScreenSmall, setIsScreenSmall] = useState<boolean>(false);
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
      if (face && face[0] && face[0].scaledMesh) {
        const faceBox: any = face[0].boundingBox;
        const newBoundingBox: IBoundingBox = {
          tlX: faceBox.topLeft[0],
          tlY: faceBox.topLeft[1],
          brX: faceBox.bottomRight[0],
          brY: faceBox.bottomRight[1],
        };
        const width = newBoundingBox.brX - newBoundingBox.tlX;
        const height = newBoundingBox.brY - newBoundingBox.tlY;
        if (canvasRefFace.current) {
          const ctx = canvasRefFace.current.getContext(
            "2d"
          ) as CanvasRenderingContext2D;
          requestAnimationFrame(() => {
            ctx.clearRect(0, 0, videoWidth, videoHeight);
            drawMesh(face, ctx);
          });
        }
        setBoundingBox(newBoundingBox);
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
      canvasRef.current &&
      canvasRefFace.current
    ) {
      setIsLoading(true);
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = video.offsetWidth;
      const videoHeight = video.offsetHeight;
      console.log(videoWidth, videoHeight);
      console.log("UPDATEING CANVAS SIZE...");
      // Set video/canvas width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      canvasRefFace.current.width = videoWidth;
      canvasRefFace.current.height = videoHeight;
      const ctx = canvasRef.current.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "white";
      ctx.roundRect(
        videoWidth / 3,
        videoHeight / 6,
        videoWidth / 2.5,
        videoHeight / 1.7,
        10
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
    setIsScreenSmall(window.innerWidth < 778);
    // Handler to call on window resize
    function handleResize() {
      console.log("RESIZE");
      console.log(window.innerWidth);
      console.log(isScreenSmall);
      if (window.innerWidth < 778 && !isScreenSmall) {
        console.log("A");
        setIsScreenSmall(true);
        initFaceAssist();
      }
      if (window.innerWidth > 777 && isScreenSmall) {
        console.log("B");
        setIsScreenSmall(false);
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
    <div className="absolute m-auto left-0 right-0 min-h-[480px] w-[640px]">
      <Webcam
        ref={webcamRef}
        className={`rounded-tl-xl rounded-tr-xl ${
          isLoading && "invisible"
        } absolute top-0`}
      />
      <canvas
        ref={canvasRef}
        className={`rounded-tl-xl rounded-tr-xl ${
          isLoading && "invisible"
        } absolute top-0`}
      />
      <canvas
        ref={canvasRefFace}
        className={`rounded-tl-xl rounded-tr-xl ${
          isLoading && "invisible"
        } absolute top-0`}
      />
      <div
        className={`${
          !isLoading && "hidden"
        } absolute bg-gray-500 w-[640px] h-[480px] rounded-tl-xl rounded-tr-xl max-w-xl animate-pulse top-0`}
      ></div>
      <div className="absolute top-[480px] border rounded-br-xl rounded-bl-xl b w-[640px] py-2 px-2">
        <p className="text-sky-400">Face Assist</p>
      </div>
    </div>
  );
}
