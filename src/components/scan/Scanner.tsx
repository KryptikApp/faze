import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as face from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { LoadingOutlined, PoweroffOutlined } from "@ant-design/icons";
import {
  Eye,
  IBlink,
  belowEARThreshold,
  computeCombinedEAR,
} from "@/types/eye";

interface ICamSize {
  width: number;
  height: number;
}

export default function Scanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefFace = useRef<HTMLCanvasElement>(null);
  const distRef = useRef<number>(0);
  const [distFromCamera, setDistFromCamera] = useState<number>(0);
  const [boundingBox, setBoundingBox] = useState<IBoundingBox | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isScreenSmall, setIsScreenSmall] = useState<boolean>(false);
  const [camSize, setCamSize] = useState<ICamSize>({ width: 576, height: 432 });
  const [blinkCount, setBlinkCount] = useState<number>(0);
  const [historicalBlinks, setHistoricalBlinks] = useState<IBlink[]>([]);
  // eye aspect ratio. 1 corresponds to open eye, 0 to closed eye
  // computed across both eyes
  const [lastEAR, setLastEAR] = useState<number>(1);
  const [newEAR, setNewEar] = useState<number>(1);

  // score indicating how well the user is positioned
  const [assistScore, setAssistScore] =
    useState<AssistScore>(defaultAssistScore);
  const [targetFaceBox, setTargetFaceBox] = useState<IBoundingBox | null>(null);

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
      video.width = camSize.width;
      video.height = camSize.height;
      const face = await net.estimateFaces({ input: video });
      const xRatio = camSize.width / 640;
      const yRatio = camSize.height / 480;
      if (face && face[0] && face[0].scaledMesh) {
        const faceBox: any = face[0].boundingBox;
        // adjust for camera size
        const newBoundingBox: IBoundingBox = {
          tlX: faceBox.topLeft[0] * xRatio,
          tlY: faceBox.topLeft[1] * yRatio,
          brX: faceBox.bottomRight[0] * xRatio,
          brY: faceBox.bottomRight[1] * yRatio,
        };
        // compute assist score
        handleFaceAssist(newBoundingBox);
        const width = newBoundingBox.brX - newBoundingBox.tlX;
        const height = newBoundingBox.brY - newBoundingBox.tlY;
        if (canvasRefFace.current) {
          const ctx = canvasRefFace.current.getContext(
            "2d"
          ) as CanvasRenderingContext2D;
          requestAnimationFrame(() => {
            ctx.clearRect(0, 0, camSize.width, camSize.height);
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "white";
            ctx.roundRect(
              newBoundingBox.tlX,
              newBoundingBox.tlY,
              width,
              height,
              10
            );
            ctx.stroke();
            // drawMesh(face, ctx);
          });
        }
        // run eye detection
        handleBlinkDetection(face[0].mesh, lastEAR);
        setBoundingBox(newBoundingBox);
      } else {
        // TODO: clear canvas
        handleFaceAssist(null);
      }
      setHasLoaded(true);
      setIsLoading(false);
      return face;
    } else {
      setHasLoaded(false);
      return null;
    }
  }

  /** Provide suggestions for user face position and orinetation. Suggestions are derived from the difference between the inferred face position and the target bounding box. */
  function handleFaceAssist(currFaceBox: IBoundingBox | null) {
    const newAssistScore: AssistScore = assist(targetFaceBox, currFaceBox);
    setAssistScore(newAssistScore);
    updateTargetBox(targetFaceBox, newAssistScore.color);
  }

  function handleBlinkDetection(landmarks: any, lastEARVal: number) {
    try {
      const leftEye = new Eye(landmarks, "left");
      const rightEye = new Eye(landmarks, "right");
      const newEAR: number = computeCombinedEAR(leftEye, rightEye);
      setNewEar(newEAR);
    } catch (e) {
      console.warn("Unable to run eye detection");
      console.error(e);
    }
  }

  /** Activates camera.*/
  function handleToggleCamera() {
    // don't do anything if loading
    if (isLoading) return;
    setAssistScore(defaultAssistScore);
    setBoundingBox(null);
    const newTargetBox: IBoundingBox = {
      tlX: camSize.width / 4,
      tlY: camSize.height / 7,
      brX: (3 * camSize.width) / 4,
      brY: (6 * camSize.height) / 7,
    };
    setTargetFaceBox(newTargetBox);
    // loading state is true if camera is pulling up
    if (!isCameraActive) setIsLoading(true);
    setIsCameraActive(!isCameraActive);
  }

  /** Updates target box dfimensions and color */
  function updateTargetBox(newTargetBox: IBoundingBox | null, color: string) {
    if (!newTargetBox) return;
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

  function updateCamSize(newWidth: number, newHeight: number) {
    console.log("Initializing cam size...");
    if (canvasRef.current && canvasRefFace.current) {
      canvasRefFace.current.width = newWidth;
      canvasRefFace.current.height = newHeight;
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
      const newTargetFaceBox: IBoundingBox = {
        tlX: newWidth / 4,
        tlY: newHeight / 7,
        brX: (3 * newWidth) / 4,
        brY: (6 * newHeight) / 7,
      };
      setCamSize({ width: newWidth, height: newHeight });
      setTargetFaceBox(newTargetFaceBox);
      console.log("Cam size updated.");
    }
  }

  useEffect(() => {
    setIsScreenSmall(window.innerWidth < 778);
    // Handler to call on window resize
    function handleResize() {
      // small screen
      if (window.innerWidth < 778 && !isScreenSmall) {
        setIsScreenSmall(true);
      }
      // big screen
      if (window.innerWidth > 777 && isScreenSmall) {
        setIsScreenSmall(false);
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
  }, []);

  // TODO: updateso we don't have to relay on useEffect hook
  useEffect(() => {
    const isBlink = belowEARThreshold(newEAR);
    const wasLastBlink = belowEARThreshold(lastEAR);
    if (isBlink && !wasLastBlink) {
      setBlinkCount(blinkCount + 1);
      const newBlink: IBlink = {
        timestamp: Date.now(),
        EAR: newEAR,
      };
      setHistoricalBlinks([...historicalBlinks, newBlink]);
    }
    // update lastEAR regardless of whether blink was detected
    setLastEAR(newEAR);
  }, [newEAR]);

  useEffect(() => {
    console.log("Screen size changed.");
    if (isScreenSmall) {
      updateCamSize(384, 288);
    } else {
      updateCamSize(576, 432);
    }
  }, [isScreenSmall]);

  useEffect(() => {
    if (canvasRefFace.current !== null && canvasRef.current !== null) {
      const faceCtx = canvasRefFace.current.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      const canvasCtx = canvasRef.current.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      // faceCtx.clearRect(0, 0, 1000, 1000);
      // canvasCtx.clearRect(0, 0, 1000, 1000);
      canvasCtx.clearRect(0, 0, camSize.width, camSize.height);
      faceCtx.clearRect(0, 0, camSize.width, camSize.height);
    }
    if (!hasLoaded && isCameraActive) {
      setIsLoading(true);
      initFaceDetection();
    } else {
      setIsLoading(false);
    }
  }, [isCameraActive]);

  return (
    <div className="absolute m-auto left-0 right-0 min-h-[480px] max-w-sm md:max-w-xl w-[100%]">
      <div
        className={`${
          (!isCameraActive || isLoading) && "hidden"
        } absolute t-0 l-0 rounded-xl text-white px-2 pt-1 pb-2 z-[100] text-2xl w-fit hover:scale-110 transition-transform hover:cursor-pointer ml-2 mt-2 bg-gray-100/20`}
        onClick={handleToggleCamera}
      >
        <PoweroffOutlined size={20} className="" />
      </div>
      {/* camera */}
      {isCameraActive && (
        <div>
          <Webcam
            ref={webcamRef}
            className={`rounded-tl-xl rounded-tr-xl z-10 max-w-sm md:max-w-xl border-r border-l border-t border-gray-400`}
            style={{
              width: camSize.width,
              height: camSize.height,
            }}
          />
        </div>
      )}
      {/* activate camera button */}
      <div
        className={`${
          isCameraActive && "hidden"
        } rounded-tl-xl rounded-tr-xl border border-t border-r border-l border-gray-400 z-[100] ${
          isLoading && "bg-gray-500 animate-pulse"
        }`}
        style={{
          width: camSize.width,
          height: camSize.height,
          paddingTop: camSize.height / 2 - 50,
        }}
      >
        <div
          className="hover:cursor-pointer text-center font-semibold text-gray-400 flex flex-col space-y-2 w-fit mx-auto hover:text-sky-400 transition-color z-[100]"
          onClick={handleToggleCamera}
        >
          {isLoading && <LoadingOutlined size={14} className="animate-spin" />}
          <p className="text-3xl">Activate Camera</p>
          <PoweroffOutlined size={14} className="" />
        </div>
      </div>
      {/* face canvases */}
      <canvas
        ref={canvasRef}
        className={`rounded-tl-xl rounded-tr-xl ${
          !isCameraActive && "hidden"
        } absolute top-0`}
      />
      <canvas
        ref={canvasRefFace}
        className={`rounded-tl-xl rounded-tr-xl ${
          !isCameraActive && "hidden"
        } absolute top-0`}
      />
      {/* face assist */}
      <div
        className=" border-r border-l border-b border-gray-400 rounded-br-xl rounded-bl-xl pb-2"
        style={{
          width: camSize.width,
        }}
      >
        <ProgressBar progressPercent={assistScore.score} />
        <div className="px-2 min-h-[70px]">
          {isCameraActive && (
            <div className="mt-2 flex flex-col space-y-2">
              <p className="text-gray-700 dark:text-gray-200 font-bold text-center text-3xl">
                {assistScore.msg}
              </p>
              <p className="text-gray-700 dark:text-gray-200 font-semibold text-center text-xl">
                {blinkCount} blinks
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
