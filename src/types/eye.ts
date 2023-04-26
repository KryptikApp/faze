import { Coord3D } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util";
import { ILandmark } from "./face";
import {
  calculateDistance,
  calculateMidpoint,
  convertCoordToLandmark,
} from "@/utils";

// positions dervived from the following landmark map...
// https://raw.githubusercontent.com/google/mediapipe/a908d668c730da128dfa8d9f6bd25d519d006692/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png

const p1PosLeft: number = 33;
const p1PosRight: number = 362;
const p2PosLeft: number = 164;
const p2PosRight: number = 384;
const p3PosLeft: number = 157;
const p3PosRight: number = 387;
const p4PosLeft: number = 133;
const p4PosRight: number = 263;
const p5PosLeft: number = 154;
const p5PosRight: number = 373;
const p6PosLeft: number = 163;
const p6PosRight: number = 381;

type EyeSide = "left" | "right";

/**
 * @interface IBlink
 * @param {number} EAR - The eye aspect ratio (EAR) at the time of blink
 * @param {number} timestamp - The time of blink in ms since epoch
 */
export interface IBlink {
  EAR: number;
  timestamp: number;
}

export class Eye {
  p1: ILandmark;
  p2: ILandmark;
  p3: ILandmark;
  p4: ILandmark;
  p5: ILandmark;
  p6: ILandmark;
  side: EyeSide;
  constructor(landmarks: Coord3D[], side: EyeSide) {
    this.side = side;
    this.p1 = convertCoordToLandmark(
      landmarks[side === "left" ? p1PosLeft : p1PosRight]
    );
    this.p2 = convertCoordToLandmark(
      landmarks[side === "left" ? p2PosLeft : p2PosRight]
    );
    this.p3 = convertCoordToLandmark(
      landmarks[side === "left" ? p3PosLeft : p3PosRight]
    );
    this.p4 = convertCoordToLandmark(
      landmarks[side === "left" ? p4PosLeft : p4PosRight]
    );
    this.p5 = convertCoordToLandmark(
      landmarks[side === "left" ? p5PosLeft : p5PosRight]
    );
    this.p6 = convertCoordToLandmark(
      landmarks[side === "left" ? p6PosLeft : p6PosRight]
    );
  }

  /**
   * @description Computes the eye aspect ratio (EAR) for the eye. EAR will be approximately constant while the eye is open, and it will quickly fall to zero when a blink occurs.
   * @see {@link http://vision.fe.uni-lj.si/cvww2016/proceedings/papers/05.pdf}
   * @returns {number} - The eye aspect ratio
   */
  getEAR(): number {
    const midPointTop = calculateMidpoint(this.p2, this.p3);
    const midPointBottom = calculateMidpoint(this.p5, this.p6);
    const verticalDistance = calculateDistance(midPointTop, midPointBottom);
    const horizontalDistance = calculateDistance(this.p1, this.p4);
    console.log("Horizontal Distance: ", horizontalDistance);
    console.log("Vertical Distance: ", verticalDistance);
    return verticalDistance / horizontalDistance;
  }

  /**
   * @description Updates the eye landmarks
   * @param {Coord3D[]} landmarks - The new landmarks
   */
  updateLandmarks(landmarks: Coord3D[]) {}
}

export const EARThreshold = 0.2;
export function computeCombinedEAR(leftEye: Eye, rightEye: Eye) {
  return rightEye.getEAR();
  //   return (leftEye.getEAR() + rightEye.getEAR()) / 2;
}

/**
 *
 * @param EAR the eye aspect ratio
 * @returns true if the EAR is below the EAR threshold, at which point we assume a blink has occured
 */
export function belowEARThreshold(EAR: number) {
  return EAR < EARThreshold;
}
