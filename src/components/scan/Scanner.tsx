import * as face from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-core";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { assist, computeVideoBrightness, shouldScan } from "@/assist";
import { IScan, computeEncoding } from "@/recognition";
import {
  Eye,
  IBlink,
  belowEARThreshold,
  computeCombinedEAR,
} from "@/types/eye";
import { AssistScore, IBoundingBox, defaultAssistScore } from "@/types/face";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { PCA } from "ml-pca";
import Webcam from "react-webcam";
import useInterval from "../hooks/useInterval";
import ProgressBar from "../progress/ProgressBar";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { checkUserRegistered, getActiveUser } from "@/auth/user";
import { registerUser, verifyScan } from "@/auth/verify";
import Link from "next/link";
import { User } from "@prisma/client";
import { useRouter } from "next/router";

interface ICamSize {
  width: number;
  height: number;
}

enum LoginProgress {
  name = 0,
  register = 1,
  query = 2,
  registerDone = 3,
  queryDone = 4,
}

export default function Scanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefFace = useRef<HTMLCanvasElement>(null);
  const distRef = useRef<number>(0);
  const [distFromCamera, setDistFromCamera] = useState<number>(0);
  const [boundingBox, setBoundingBox] = useState<IBoundingBox | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isScreenSmall, setIsScreenSmall] = useState<boolean>(false);
  const [camSize, setCamSize] = useState<ICamSize>({ width: 576, height: 432 });
  const [blinkCount, setBlinkCount] = useState<number>(0);
  const [historicalBlinks, setHistoricalBlinks] = useState<IBlink[]>([]);
  const [scanCount, setScanCount] = useState<number>(0);
  // eye aspect ratio. 1 corresponds to open eye, 0 to closed eye
  // computed across both eyes
  const [lastEAR, setLastEAR] = useState<number>(1);
  const [newEAR, setNewEar] = useState<number>(1);
  const [pca, setPca] = useState<PCA | null>(null);
  const [detector, setDetector] = useState<MediaPipeFaceMesh | null>(null);
  const [interval, setInterval] = useState<number>(3000);
  const [loginProgress, setLogInProgress] = useState<LoginProgress>(
    LoginProgress.name
  );
  const [name, setName] = useState<string>("");
  const [videoBrightness, setVideoBrightness] = useState<number>(0);
  const [isVideoDark, setIsVideoDark] = useState<boolean>(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean>(false);
  const [isUserRegistered, setIsUserRegistered] = useState<boolean>(true);
  const [showBlinks, setShowBlinks] = useState<boolean>(false);
  const [historicalScans, setHistoricalScans] = useState<IScan[]>([]);
  const [humanityVerified, setHumanityVerified] = useState<boolean>(false);
  const [challengesPassed, setChallengesPassed] = useState<number>(0);
  const [isRequestVerification, setIsRequestVerification] =
    useState<boolean>(false);
  const desiredScansReg = 10;
  const desiredScansQuery = 1;
  const [challengeInterval, setChallengeInterval] = useState<number>(3000);
  const [challengeTime, setChallengeTime] = useState<number>(0);
  const [showChallenge, setShowChallenge] = useState<boolean>(false);

  const router = useRouter();

  useInterval(() => {
    if (humanityVerified) return;
    if (showChallenge) {
      setShowChallenge(false);
      setChallengeInterval(500);
      return;
    }
    setChallengeInterval(3000);
    setChallengeTime(Date.now());
    setShowChallenge(true);
  }, challengeInterval);

  // score indicating how well the user is positioned
  const [assistScore, setAssistScore] =
    useState<AssistScore>(defaultAssistScore);
  const [targetFaceBox, setTargetFaceBox] = useState<IBoundingBox | null>(null);

  function updateDistFromCamera(rawVal: number) {
    setDistFromCamera(rawVal);
  }

  async function initFaceDetection() {
    const newDetector: MediaPipeFaceMesh = await face.load(
      face.SupportedPackages.mediapipeFacemesh,
      {
        maxFaces: 1,
      }
    );
    // fetch saved pca
    const savedPcaPath = "/landmarksPCA.json";
    const pca = await fetch(savedPcaPath);
    const pcaJson = await pca.json();
    const pcaModel = PCA.load(pcaJson);
    setPca(pcaModel);
    setInterval(100);
    setDetector(newDetector);
  }

  useInterval(() => {
    detect(detector);
  }, interval);

  function resetScans() {
    setHistoricalScans([]);
    setHistoricalBlinks([]);
    setScanCount(0);
    setBlinkCount(0);
  }

  async function handleVerification() {
    console.log("handling verification...");
    if (!isRequestVerification) return;
    setIsLoading(true);
    let approved = false;
    if (!humanityVerified) {
      toast.error("Still verifying humanity.");
    }
    if (!isUserRegistered) {
      console.log("registering user");
      approved = await registerUser(name, historicalScans);
      console.log(approved);
      if (approved) {
        handleToggleCamera();
        setLogInProgress(LoginProgress.registerDone);
        toast.success("Registration successful!");
      }
    } else {
      approved = await verifyScan(name, historicalScans);
      if (approved) {
        handleToggleCamera();
        setLogInProgress(LoginProgress.queryDone);
        toast.success("Verification successful!");
      }
    }
    if (!approved) {
      handleStartOver();
      toast.error("Verification failed. Please try again.");
    }
    setIsRequestVerification(false);
    setIsLoading(false);
  }

  useEffect(() => {
    handleVerification();
  }, [isRequestVerification]);

  useInterval(() => {
    if (!webcamRef.current) return;
    const video = webcamRef.current.video;
    if (!video) return;
    const newBrightness = computeVideoBrightness(video);
    console.log(
      "Video brightness: ",
      newBrightness,
      "is dark: ",
      newBrightness < 70 ? "yes" : "no"
    );
    setVideoBrightness(newBrightness);
    setIsVideoDark(newBrightness < 100);
  }, 2000);

  async function detect(net: MediaPipeFaceMesh | null) {
    if (!net) return;
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const face = await net.estimateFaces({
        input: video,
      });
      const xRatio = video.offsetWidth / video.videoWidth;
      const yRatio = video.offsetHeight / video.videoHeight;
      if (face && face[0] && face[0].scaledMesh) {
        const faceBox: any = face[0].boundingBox;
        // adjust for camera size
        const newBoundingBox: IBoundingBox = {
          tlX: video.offsetWidth - faceBox.topLeft[0] * xRatio,
          tlY: faceBox.topLeft[1] * yRatio,
          brX: video.offsetWidth - faceBox.bottomRight[0] * xRatio,
          brY: faceBox.bottomRight[1] * yRatio,
        };
        // compute assist score
        handleFaceAssist(newBoundingBox, face[0].scaledMesh);
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
            ctx.ellipse(
              newBoundingBox.tlX,
              newBoundingBox.tlY,
              10,
              10,
              0,
              0,
              2 * Math.PI
            );
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
        handleBlinkDetection(face[0].scaledMesh, lastEAR);
        setBoundingBox(newBoundingBox);
      } else {
        // clear canvas
        if (canvasRefFace.current) {
          const ctx = canvasRefFace.current.getContext(
            "2d"
          ) as CanvasRenderingContext2D;
          requestAnimationFrame(() => {
            ctx.clearRect(0, 0, camSize.width, camSize.height);
          });
        }
        handleFaceAssist(null, null);
      }
      setHasLoaded(true);
      setIsLoading(false);
      return face;
    } else {
      setHasLoaded(false);
      return null;
    }
  }

  function handleVerifyHumanity(newBlinks: IBlink[]) {
    if (humanityVerified) return;
    // make sure blink was within one second of request
    // const blinkTime = lastBlink.timestamp;
    // const timeDiff = blinkTime - challengeTime;
    // if (timeDiff < 5000) {
    //   const newCount = challengesPassed + 1;
    //   setChallengesPassed(newCount);
    //   if (newCount >= 1) {
    //     setHumanityVerified(true);
    //     setChallengesPassed(0);
    //     toast("Check passed.");
    //   }
    // }
    // return;
    if (newBlinks.length < 1) return;
    setHumanityVerified(true);
  }

  /** Extract face encodings */
  async function handleRecognition(
    landmarks: any | null,
    currAssistScore: AssistScore
  ) {
    if (!landmarks) return;
    if (!pca) return;
    if (!humanityVerified) return;
    // don't scan if video is dark
    if (isVideoDark) return;
    const desiredScans = isUserRegistered ? desiredScansQuery : desiredScansReg;
    const shouldScanNew = shouldScan(
      historicalScans,
      assistScore,
      desiredScans
    );
    if (!shouldScanNew) {
      return;
    }
    try {
      const faceEncoding = await computeEncoding(landmarks, pca);
      const newScan: IScan = {
        encoding: faceEncoding,
        score: currAssistScore.score,
        timestamp: Date.now(),
      };
      const newScans = [...historicalScans, newScan];
      setHistoricalScans(newScans);
      setScanCount(scanCount + 1);
      // if we have enough scans, request verification
      if (newScans.length == desiredScans) {
        setIsRequestVerification(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  /** Provide suggestions for user face position and orinetation. Suggestions are derived from the difference between the inferred face position and the target bounding box. */
  function handleFaceAssist(
    currFaceBox: IBoundingBox | null,
    currLandmarks: any
  ) {
    const newAssistScore: AssistScore = assist(
      targetFaceBox,
      currFaceBox,
      true
    );

    handleRecognition(currLandmarks, newAssistScore);
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

  function handleStartOver() {
    setHumanityVerified(false);
    setChallengesPassed(0);
    setLogInProgress(LoginProgress.name);
    setIsRequestVerification(false);
    setShowBlinks(false);
    resetScans();
    handleToggleCamera();
  }

  /** Activates camera.*/
  function handleToggleCamera() {
    // don't do anything if loading
    if (isLoading) return;
    setAssistScore(defaultAssistScore);
    setBoundingBox(null);
    const newTargetBox: IBoundingBox = {
      tlX: (3 * camSize.width) / 4,
      tlY: camSize.height / 7,
      brX: camSize.width / 4,
      brY: (6 * camSize.height) / 7,
    };
    setTargetFaceBox(newTargetBox);
    // loading state is true if camera is pulling up
    if (!isCameraActive) setIsLoading(true);
    setIsCameraActive(!isCameraActive);
    setAssistScore(defaultAssistScore);
    setScanCount(0);
    setBlinkCount(0);
  }

  /** Updates target box dimensions and color */
  function updateTargetBox(newTargetBox: IBoundingBox | null, color: string) {
    if (!newTargetBox) return;
    const ctx = canvasRef.current?.getContext("2d") || null;
    if (!ctx) return;
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.ellipse(newTargetBox.tlX, newTargetBox.tlY, 10, 10, 0, 0, 2 * Math.PI);
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

  async function handleVerifyName() {
    if (name.length < 3) {
      toast.error("Name must be at least 3 characters long");
      return;
    }
    const activeUser: User | null = await getActiveUser();
    if (activeUser && activeUser.username == name) {
      toast.success("Logged in!");
      router.push("../profile");
      return;
    }
    setIsLoading(true);
    setIsLoading(false);
    const res = await checkUserRegistered(name);
    console.log("REGISTERED RESPONSE:");
    console.log(res);
    const newIsRegistered = res.isRegistered;
    const newIsAvailable = res.isAvailable;
    setIsUserRegistered(newIsRegistered);
    setIsNameAvailable(newIsAvailable);
    if (!newIsAvailable) {
      toast("Logging in...");
    }
    if (newIsRegistered) {
      setLogInProgress(LoginProgress.query);
    } else {
      setLogInProgress(LoginProgress.register);
    }
  }

  const camVariants = {
    visible: { opacity: 1, transition: { delay: 0.3 } },
    hidden: { opacity: 0 },
  };

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

      const newHistoricalBlinks = [...historicalBlinks, newBlink];
      handleVerifyHumanity(newHistoricalBlinks);
      setHistoricalBlinks(newHistoricalBlinks);
      // get last three blinks
      const lastThreeBlinks = historicalBlinks.slice(-3);
      // check if last three blinks were within 3 seconds of each other
      const isBlinkingUnlocked =
        lastThreeBlinks.length >= 3 &&
        lastThreeBlinks.every(
          (blink) => newBlink.timestamp - blink.timestamp < 3000
        );
      if (isBlinkingUnlocked && !showBlinks) {
        setShowBlinks(true);
        toast.success("Blinking easter egg unlocked!");
      }
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
    <div
      className={`absolute m-auto left-0 right-0 ${
        loginProgress != LoginProgress.name &&
        loginProgress != LoginProgress.queryDone &&
        loginProgress != LoginProgress.registerDone
          ? "min-h-[480px]"
          : "h-fit"
      } max-w-sm md:max-w-xl border border-gray-400 rounded-xl`}
    >
      {isScreenSmall && (
        <div className="min-h-[400px] bg-gray-100/10">
          <p className="text-2xl font-semibold my-auto text-center pt-28 px-2">
            Please use a larger device to test FAZE ID.
          </p>
        </div>
      )}
      {!isScreenSmall && (
        <div>
          {/* camera poweroff toggle */}
          <div
            className={`${
              (!isCameraActive || isLoading) && "hidden"
            } absolute t-0 l-0 rounded-xl text-white px-2 pt-1 pb-2 z-[100] text-2xl w-fit hover:scale-110 transition-transform hover:cursor-pointer ml-2 mt-2 bg-gray-100/20`}
            onClick={handleStartOver}
          >
            <PoweroffOutlined size={20} className="" />
          </div>
          {/* username page */}
          <AnimatePresence>
            {loginProgress == LoginProgress.name && (
              <motion.div
                className="rounded-xl bg-white/90 dark:bg-white/10 pt-4 pb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* rounded name input */}
                <div className="flex flex-col px-2 space-y-8">
                  <div className="flex flex-col mb-4">
                    <div className="flex flex-row space-x-2">
                      <Image
                        src={"/fazeLogo.png"}
                        width={50}
                        height={50}
                        alt="Faze logo"
                      />
                      <h3 className="font-semibold text-3xl dark:text-white/70 my-auto">
                        Login
                      </h3>
                    </div>

                    <p className="tex-lg text-gray-500 ml-2">
                      Verify your identity to continue.
                    </p>
                  </div>
                  <div>
                    <input
                      type="text"
                      id="Username"
                      className="bg-gray-50 dark:bg-gray-500/40 focus:border border-gray-400 w-full text-center focus:outline-none rounded-xl text-3xl font-semibold py-4"
                      placeholder="Username"
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      value={name}
                      required
                    />
                  </div>
                  <div
                    className={`w-full rounded-xl bg-green-500/50 hover:bg-green-500/90 transition-color duration-500 text-3xl font-semibold text-center py-4 hover:cursor-pointer flex flex-row space-x-2 place-items-center justify-center ${
                      isLoading && "disabled"
                    }`}
                    onClick={handleVerifyName}
                  >
                    <span className="">Next</span>
                    {/* loading circle */}
                    {isLoading && (
                      <div className="w-6 h-6 border-t-2 border-gray-200 rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={
              loginProgress == LoginProgress.query ||
              loginProgress == LoginProgress.register
                ? "visible"
                : "hidden"
            }
            variants={camVariants}
          >
            {/* camera */}
            {isCameraActive && (
              <div>
                <Webcam
                  ref={webcamRef}
                  className={`rounded-tl-xl rounded-tr-xl z-10 max-w-sm md:max-w-xl md:max-w-xl`}
                  style={{
                    width: camSize.width,
                    height: camSize.height,
                  }}
                  mirrored={true}
                />
              </div>
            )}
            {/* activate camera button */}
            <div
              className={`${
                (isCameraActive ||
                  (loginProgress != LoginProgress.query &&
                    loginProgress != LoginProgress.register)) &&
                "hidden"
              } rounded-tl-xl rounded-tr-xl z-[100] ${
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
                {isLoading && (
                  <LoadingOutlined size={14} className="animate-spin" />
                )}
                <p className="text-3xl">Activate Camera</p>
                <PoweroffOutlined size={14} className="" />
              </div>
              <div className="text-center text-gray-500 my-2">
                {loginProgress == LoginProgress.query && (
                  <p className="text-xl">
                    Verify your identity with a quick scan.
                  </p>
                )}
                {loginProgress == LoginProgress.register && (
                  <p className="text-xl">
                    Move your head slowly to enable Faze ID.
                  </p>
                )}
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
            {(loginProgress == LoginProgress.register ||
              loginProgress == LoginProgress.query) && (
              <div
                className=" rounded-br-xl rounded-bl-xl pb-2"
                style={{
                  width: camSize.width,
                }}
              >
                <ProgressBar progressPercent={assistScore.score} />
                <div className="px-2 min-h-[70px]">
                  {isCameraActive && (
                    <div className="mt-2 flex flex-col space-y-2">
                      <p
                        className={`${isVideoDark && "text-red-500"} ${
                          isRequestVerification && "text-green-400"
                        } font-bold text-center text-3xl`}
                      >
                        {isVideoDark
                          ? "Too Dark"
                          : isRequestVerification
                          ? "Verifying..."
                          : assistScore.msg}
                      </p>

                      {showBlinks && (
                        <p className="text-gray-700 dark:text-gray-200 font-semibold text-center text-xl">
                          {blinkCount} blinks
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
          {/* registration completion page */}
          <AnimatePresence>
            {loginProgress == LoginProgress.queryDone && (
              <motion.div
                className="rounded-xl bg-white/90 dark:bg-white/10 pt-4 pb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* green check circle icon outline */}
                <div className="flex flex-col px-2 space-y-4 text-center text-2xl">
                  <div className="flex flex-col space-y-2 text-green-400">
                    <CheckCircleOutlined size={20} className="text-green-400" />
                    <p className="">Verification Complete</p>
                  </div>
                  <Link
                    href="../profile"
                    className="text-xl hover:scale-105 transition-scale hover:text-green-400"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/*  query completion page */}
          <AnimatePresence>
            {loginProgress == LoginProgress.registerDone && (
              <motion.div
                className="rounded-xl bg-white/90 dark:bg-white/10 pt-4 pb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* green check circle icon outline */}
                <div className="flex flex-col px-2 space-y-4 text-center text-2xl">
                  <div className="flex flex-col space-y-2 text-green-400">
                    <CheckCircleOutlined size={20} className="text-green-400" />
                    <p className="">Registration Complete</p>
                  </div>
                  <Link
                    href="../profile"
                    className="text-xl hover:scale-105 transition-scale hover:text-green-400"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
