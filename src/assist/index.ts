import { IScan } from "@/recognition";
import { AssistScore, IBoundingBox } from "@/types/face";

/**
 * @param {IBoundingBox} targetBox - The bounding box of the ideal face position
 * @param {IBoundingBox} faceBox - The bounding box of the face to be scored
 * Returns score indicating how well a user is positioned.
 * */
// todo: update to include orientation
export function assist(
  targetBoxIn: IBoundingBox | null,
  faceBoxIn: IBoundingBox | null,
  isFlipped?: boolean
): AssistScore {
  if (!targetBoxIn || !faceBoxIn) {
    return {
      score: 0,
      msg: "No face detected",
      color: "#FFFFFF",
    };
  }
  const targetBox = { ...targetBoxIn };
  const faceBox = { ...faceBoxIn };

  const width = Math.abs(targetBox.brX - targetBox.tlX);
  const height = Math.abs(targetBox.brY - targetBox.tlY);
  if (isFlipped) {
    targetBox.tlX = targetBox.tlX - width;
    targetBox.brX = targetBox.brX + width;
    faceBox.tlX = faceBox.tlX - width;
    faceBox.brX = faceBox.brX + width;
  }
  // negative if left of target, positive if right of target
  const leftXDist = faceBox.tlX - targetBox.tlX;
  // negative if above target, positive if below target
  const topYDist = faceBox.tlY - targetBox.tlY;
  // negative if right of target, positive if left of target
  const rightXDist = targetBox.brX - faceBox.brX;
  // negative if below target, positive if above target
  const bottomYDist = targetBox.brY - faceBox.brY;
  // compute scores for each dimension
  const xScoreLeft = Math.max(0, 100 - (Math.abs(leftXDist) / width) * 100);
  const xScoreRight = Math.max(0, 100 - (Math.abs(rightXDist) / width) * 100);
  const yScoreTop = Math.max(0, 100 - (Math.abs(topYDist) / height) * 100);
  const yScoreBottom = Math.max(
    0,
    100 - (Math.abs(bottomYDist) / height) * 100
  );
  const xScore = Math.max(
    0,
    100 - (Math.abs(leftXDist + rightXDist) / width) * 100
  );
  const yScore = Math.max(
    0,
    100 - (Math.abs(topYDist + bottomYDist) / height) * 100
  );
  // average the scores
  let totalScore = (xScoreLeft + xScoreRight + yScoreTop + yScoreBottom) / 4;
  // create custom message
  let msg = "";
  const worstDimScore = Math.min(
    xScoreLeft,
    xScoreRight,
    yScoreTop,
    yScoreBottom
  );
  // think.. what actions can the user take to improve score?
  switch (worstDimScore) {
    case xScoreLeft:
      msg = "Move right";
      break;
    case xScoreRight:
      msg = "Move left";
      break;
    case yScoreTop:
      msg = "Move up";
      break;
    case yScoreBottom:
      msg = "Move down";
      break;
  }
  // if all dimensions are good, tell user to move closer
  if (leftXDist > 0 && rightXDist > 0 && topYDist > 0 && bottomYDist > 0) {
    msg = "Move closer";
  }
  if (isFlipped) {
    if (leftXDist < 0 && rightXDist < 0 && topYDist > 0 && bottomYDist > 0) {
      msg = "Move closer";
    }
  }

  // map score to non-linear scale to make it easier to improve score
  totalScore = nonLinearMap(totalScore);
  if (totalScore > 100) totalScore = 100;
  if (totalScore == 100) {
    msg = "Perfect";
  }

  // create custom shade between white and green
  // 0 is white, 100 is green
  const newColor: string = scoreToColor(totalScore);
  // assist score to return
  const finaAssistScore: AssistScore = {
    score: totalScore,
    msg,
    color: newColor,
  };
  return finaAssistScore;
}

function scoreToColor(score: number): string {
  const hue = (120 / 100) * score; // Map the score to a hue value between 0 (red) and 120 (green)
  const saturation = "100%"; // Set the saturation to 100%
  const lightness = score === 0 ? "100%" : "50%"; // Map 0 to white and other scores to 50% lightness

  return `hsl(${hue}, ${saturation}, ${lightness})`; // Return the color string in HSL format
}

function nonLinearMap(score: number): number {
  const scaledScore = score / 100; // Scale the input score to a value between 0 and 1
  let mappedScore = Math.pow(scaledScore, 1.5) * 100; // Apply the power function to adjust the scale of the output values and map the result to the output range
  if (mappedScore > 90) {
    // If the mapped score is greater than 88, set it to 100
    mappedScore = 100;
  }
  return mappedScore;
}

/*
 * Compute the brightness of a video frame
 * @param {HTMLVideoElement} video - The video element to compute the brightness of
 * @returns {number} - The brightness of the video frame as a number between 0 and 255
 */
export function computeVideoBrightness(video: HTMLVideoElement): number {
  // Create a canvas element and set its width and height to match the video
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  if (canvas.width == 0 || canvas.height == 0) {
    return 150;
  }
  // Get the 2D context of the canvas and draw the current video frame onto it
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Get the image data from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Loop over each pixel in the image and calculate its brightness
  let brightnessSum = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    // The pixel data is stored in RGBA format, so we can calculate the brightness
    // by averaging the R, G, and B values and weighting each component equally
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const brightness = (r + g + b) / 3;
    brightnessSum += brightness;
  }

  // Calculate the average brightness of the frame
  const pixelCount = imageData.data.length / 4;
  const averageBrightness = brightnessSum / pixelCount;

  return averageBrightness;
}

/**
 * @param {IScan[]} prevScans - array of previous scans
 * @param {AssistScore} assistScore - current assist score
 * @returns Returns true if we should scan again
 * */
export function shouldScan(
  prevScans: IScan[],
  assistScore: AssistScore,
  desiredScans: number = 10
): boolean {
  let scoreThreshold = 80;
  // elevate threshold if we only want 1 scan
  // should be high quality
  if (desiredScans === 1) {
    scoreThreshold = 90;
  }
  // get time since last scan
  const now = Date.now();
  if (prevScans.length >= desiredScans) {
    return false;
  }
  if (prevScans.length === 0) {
    if (assistScore.score > scoreThreshold) {
      return true;
    }
    return false;
  }
  const timeSinceLastScan = now - prevScans[prevScans.length - 1].timestamp;
  // if time since last scan is greater than .5 seconds, scan
  if (timeSinceLastScan > 500 && assistScore.score > scoreThreshold) {
    return true;
  }
  return false;
}
