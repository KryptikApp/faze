import { ILandmark } from "@/types/face";
import { Coord3D } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util";

/**
 * @description Converts 3d coordinate to landmark object
 * */
export function convertCoordToLandmark(input: Coord3D): ILandmark {
  try {
    return {
      x: input[0],
      y: input[1],
      z: input[2],
    };
  } catch (e) {
    throw new Error(
      "Unable to convert input to landmark. Ensure input arg is of type 'Coord3D'."
    );
  }
}

/**
 * @description Calculates midpoint between two landmarks
 * @param {ILandmark} l1 - The first landmark
 * @param {ILandmark} l2 - The second landmark
 */
export function calculateMidpoint(l1: ILandmark, l2: ILandmark) {
  return {
    x: (l1.x + l2.x) / 2,
    y: (l1.y + l2.y) / 2,
    z: (l1.z + l2.z) / 2,
  };
}

/**
 * @description Calculates the distance between two landmarks. Only x/y coordinates are used.
 * @param {ILandmark} l1 - The first landmark
 * @param {ILandmark} l2 - The second landmark
 */
export function calculateDistance(l1: ILandmark, l2: ILandmark) {
  return Math.sqrt(Math.pow(l2.x - l1.x, 2) + Math.pow(l2.y - l1.y, 2));
}
