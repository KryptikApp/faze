import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as face from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { drawMesh } from "@/utils/drawMesh";
import {
  AssistScore,
  IBoundingBox,
  defaultAssistScore,
  idealFaceBox,
} from "@/types/face";
import { assist } from "@/assist";
import ProgressBar from "../progress/ProgressBar";

export default function Scanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefFace = useRef<HTMLCanvasElement>(null);
  const distRef = useRef<number>(0);
  const [distFromCamera, setDistFromCamera] = useState<number>(0);
  const [boundingBox, setBoundingBox] = useState<IBoundingBox | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScreenSmall, setIsScreenSmall] = useState<boolean>(false);
  // score indicating how well the user is positioned
  const [assistScore, setAssistScore] =
    useState<AssistScore>(defaultAssistScore);
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
        // compute assist score
        handleFaceAssist(newBoundingBox);
        // const width = newBoundingBox.brX - newBoundingBox.tlX;
        // const height = newBoundingBox.brY - newBoundingBox.tlY;
        // if (canvasRefFace.current) {
        //   const ctx = canvasRefFace.current.getContext(
        //     "2d"
        //   ) as CanvasRenderingContext2D;
        //   requestAnimationFrame(() => {
        //     ctx.clearRect(0, 0, videoWidth, videoHeight);
        //     drawMesh(face, ctx);
        //   });
        // }
        setBoundingBox(newBoundingBox);
      } else {
        handleFaceAssist(null);
      }

      return face;
    } else {
      return null;
    }
  }

  /** Provide suggestions for user face position and orinetation. Suggestions are derived from the difference between the inferred face position and the target bounding box. */
  function handleFaceAssist(currFaceBox: IBoundingBox | null) {
    const newAssistScore: AssistScore = assist(targetFaceBox, currFaceBox);
    setAssistScore(newAssistScore);
    updateTargetBox(targetFaceBox, newAssistScore.color);
  }

  /** Updates target box dfimensions and color */
  function updateTargetBox(newTargetBox: IBoundingBox, color: string) {
    const ctx = canvasRef.current?.getContext("2d") || null;
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.roundRect(
      newTargetBox.tlX,
      newTargetBox.tlY,
      newTargetBox.brX - newTargetBox.tlX,
      newTargetBox.brY - newTargetBox.tlY,
      10
    );
    ctx.stroke();
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
      // ctx.beginPath();
      // ctx.lineWidth = 4;
      // ctx.strokeStyle = "white";
      // ctx.roundRect(
      //   videoWidth / 3,
      //   videoHeight / 6,
      //   videoWidth / 2.5,
      //   videoHeight / 1.7,
      //   10
      // );
      // ctx.stroke();
      console.log("face assist initialized");
      const newTargetFaceBox: IBoundingBox = {
        tlX: videoWidth / 3,
        tlY: videoHeight / 6,
        brX: videoWidth / 3 + videoWidth / 2.5,
        brY: videoHeight / 6 + videoHeight / 1.7,
      };
      setTargetFaceBox(newTargetFaceBox);
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
        } absolute top-0 z-2`}
      />
      <canvas
        ref={canvasRef}
        className={`rounded-tl-xl rounded-tr-xl ${
          isLoading && "invisible"
        } absolute top-0 z-2`}
      />
      <canvas
        ref={canvasRefFace}
        className={`rounded-tl-xl rounded-tr-xl ${
          isLoading && "invisible"
        } absolute top-0 z-2`}
      />
      <div
        className={`absolute w-[640px] h-[480px] rounded-tl-xl rounded-tr-xl top-0 border-r border-l border-t border-gray-400`}
      ></div>
      <div
        className={`${
          !isLoading && "hidden"
        } absolute bg-gray-500 w-[640px] h-[480px] rounded-tl-xl rounded-tr-xl animate-pulse top-0`}
      ></div>
      <div className="absolute top-[480px] border-r border-l border-b border-gray-400 rounded-br-xl rounded-bl-xl b w-[640px] pb-2 ">
        <ProgressBar progressPercent={assistScore.score} />
        <div className="px-2 min-h-[40px]">
          {/* <p className="mt-2">
          Your score:{" "}
          <span
            className="font-semibold"
            style={{ color: `${assistScore.color}` }}
          >
            {assistScore.score.toFixed(2)}
          </span>
        </p> */}
          <p className="mt-2 text-gray-500">{assistScore.msg}</p>
        </div>
      </div>
    </div>
  );
}
