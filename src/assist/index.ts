import { AssistScore, IBoundingBox } from "@/types/face";

/**
 * @param {IBoundingBox} targetBox - The bounding box of the ideal face position
 * @param {IBoundingBox} faceBox - The bounding box of the face to be scored
 * Returns score indicating how well a user is positioned.
 * */
// todo: update to include orientation
export function assist(
  targetBox: IBoundingBox | null,
  faceBox: IBoundingBox | null
): AssistScore {
  if (!targetBox || !faceBox) {
    return {
      score: 0,
      msg: "No face detected",
      color: "#FFFFFF",
    };
  }
  const width = targetBox.brX - targetBox.tlX;
  const height = targetBox.brY - targetBox.tlY;
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
  const totalScore = (xScoreLeft + xScoreRight + yScoreTop + yScoreBottom) / 4;
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
  // create custom shade between white and green
  // 0 is white, 100 is green
  const newColor: string = `#${Math.floor(
    ((100 - totalScore) / 100) * 255
  ).toString(16)}FF00`;
  // assist score to return
  const finaAssistScore: AssistScore = {
    score: totalScore,
    msg,
    color: newColor,
  };
  return finaAssistScore;
}
