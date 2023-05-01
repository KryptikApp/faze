import { Matrix } from "ml-matrix";
import { PCA } from "ml-pca";
import { MinHash } from "hyperfuzz";
import { EncodingsSet } from "../prisma/script";

export interface IScan {
  encoding: number[];
  timestamp: number;
  score: number;
}

/** Method that takes landmarks as inout and returns encoding of face
 * @param landmarks - landmarks of face. expected to be 468x3 array
 */
const maxMinHashVal: number = 10000000000000;
const numComponents: number = 100;
export async function computeEncoding(landmarks: any, pca: PCA) {
  // flatten landmarks
  let flatData = landmarks.flat();
  console.log(flatData.length);
  if (flatData.length !== 1404) {
    if (flatData.length > 1404) {
      flatData = flatData.slice(0, 1404);
    } else {
      throw new Error("landmarks must be 468x3 array");
    }
  }
  // convert to matrix
  const data = Matrix.from1DArray(1, 1404, flatData);
  // project to pca space
  const projected = pca.predict(data);
  // convert to array
  const pcaEncoding = projected.to2DArray()[0];
  console.log("PCA Encoding: ", pcaEncoding);
  if (pcaEncoding.length !== numComponents) {
    throw new Error(
      "PCA encoding must be 100 components. Received " +
        pcaEncoding.length +
        " components instead."
    );
  }
  // run minhash
  // const hashVal = new MinHash(20, maxMinHashVal);
  // const featureSet = new Set(pcaEncoding);
  // hashVal.computeSignature(featureSet);
  return pcaEncoding;
}

/**
 * @description Computes compares two encodings and returns similarity using euclidian distance
 * @param encoding1 first encoding
 * @param encoding2 second encoding
 * @returns similarity score between 0 and 100
 */
export async function computeSimilarity(
  encoding1: number[],
  encoding2: number[]
) {
  const distance = euclideanDistance(encoding1, encoding2);
  console.log("Distance: ", distance);
  const minDistance = 0;
  const maxDistance = Math.sqrt(Math.pow(encoding1.length, 2)); // maximum possible distance
  const similarity =
    100 - ((distance - minDistance) / (maxDistance - minDistance)) * 100;

  return Math.max(0, Math.min(100, similarity));
}

/**
 * @description Computes euclidian distance between two arrays
 * @param a first array
 * @param b second array
 * @returns euclidian distance between a and b
 * @throws Error if a and b are not the same length
 * @see https://en.wikipedia.org/wiki/Euclidean_distance
 */
function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Arrays must have the same length");
  }

  const squaredDiffs = a.map((x, i) => Math.pow(x - b[i], 2));
  const sumOfSquaredDiffs = squaredDiffs.reduce((acc, val) => acc + val, 0);
  const distance = Math.sqrt(sumOfSquaredDiffs);

  return distance;
}

/**
 * @description Computes avg similarity between query and registered set.
 * @param query query encoding
 * @param query id of query
 * @param registeredSet set of registered encodings for all user
 * @returns true if avg similarity is greater than recognitionThreshold, else false
 */
interface INeighbor {
  id: string;
  distance: number;
}
export async function validateEncoding(
  query: number[],
  queryId: string,
  registeredSet: EncodingsSet
) {
  const neighbors: INeighbor[] = [];
  for (const encoding of registeredSet) {
    const newDist = euclideanDistance(encoding.encoding, query);
    neighbors.push({ id: encoding.userId, distance: newDist });
  }
  // sort neighbors by distance
  neighbors.sort((a, b) => a.distance - b.distance);
  // get top 10 neighbors
  const top5 = neighbors.slice(0, 10);
  // check if majority of top 5 neighbors match the query id
  const majority = top5.filter((neighbor) => neighbor.id === queryId);
  if (majority.length >= 7) {
    return true;
  }
  return false;
}

// const recognitionThreshold = 80;
// export async function validateEncoding(
//   query: number[],
//   registeredSet: number[][]
// ) {
//   const similarityStore: number[] = [];
//   for (const encoding of registeredSet) {
//     const similarity = await computeSimilarity(encoding, query);
//     similarityStore.push(similarity);
//   }

//   const avgSimilarity =
//     similarityStore.reduce((a, b) => a + b, 0) / similarityStore.length;
//   console.log("Similarity Store: ", similarityStore);
//   console.log("Average Similarity: ", avgSimilarity);
//   if (avgSimilarity > recognitionThreshold) {
//     return true;
//   }
//   return false;
// }
