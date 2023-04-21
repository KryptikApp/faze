/**
 * @interface IBoundingBox
 * @description Interface for the bounding box of a face
 * @property {number} tlX - The top left x coordinate of the bounding box
 * @property {number} tlY - The top left y coordinate of the bounding box
 * @property {number} brX - The bottom right x coordinate of the bounding box
 * @property {number} brY - The bottom right y coordinate of the bounding box
 */
export interface IBoundingBox {
  tlX: number;
  tlY: number;
  brX: number;
  brY: number;
}

export const idealFaceBox: IBoundingBox = {
  tlX: 200,
  tlY: 100,
  brX: 500,
  brY: 400,
};
