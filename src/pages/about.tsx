import Image from "next/image";
import dynamic from "next/dynamic";
import { PopSquare } from "@/components/PopSquare";
import { ArrowDownOutlined } from "@ant-design/icons";
import Link from "next/link";

const DynamicHeader = dynamic(() => import("../components/scan/Scanner"), {
  ssr: false,
  loading: () => <p className="text-center">Loading...</p>,
});

export default function Home() {
  return (
    <div className="max-w-2xl min-h-[40vh] mx-auto mt-[12vh] rounded-xl text-lg">
      <div className="h-[20vh]" />
      <div className="sticky top-2 bg-gradient-to-r from-green-500/90 via-sky-500/90 to-green-400/90 border-green-700 w-full rounded-xl p-2 text-center my-8 z-10">
        <h1 className="text-3xl md:text-7xl font-bold">FAZE ID</h1>
        <p className="text-lg md:text-2xl ">Methods behind the magic.</p>
      </div>
      <div className="h-[50vh]" />
      {/* bouncy down arrow at bottom of screen should dissapear once scroll happens */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 text-center">
        <ArrowDownOutlined className="text-2xl animate-bounce rounded-full py-1 px-2 text-gray-400 border border-gray-400" />
        <p className="text-xl text-gray-500">
          FAZE ID is designed to be a fast and simple way to authenticate users.
        </p>
      </div>
      <div className="space-y-3.5">
        <h1 className="text-4xl font-bold">Introduction</h1>
        <p>
          Permissionless networks allow anyone to access and update shared
          resources. However, since anyone can join the network, there is a high
          risk of spam. As a result, many decentralized applications rely on
          centralized identity services that increase friction and reduce
          privacy.
        </p>
        <p>
          Faze ID is bringing privacy-preserving face authentication to the
          browser. Faze allows anyone to authenticate with a simple face scan.
          In addition, the client computes all face encodings, so the server can
          never access the raw video data.
        </p>
        <p>
          All code is open source, and Faze will soon be available as a one-line
          plugin. If successful, Faze ID will help improve the Sybil-resistance
          of permissionless networks while preserving users' privacy.
        </p>
        <h1 className="text-4xl font-bold">Features</h1>
        <p>
          Faze ID includes several assistance features that facilitate the
          authentication experience. While most operate ‘under the hood,’ the
          overall effect is a clean and delightful user experience.
        </p>
      </div>
      {/* Face Assist */}
      <div className="mt-4 mb-12">
        <div className="my-8">
          <h1 className="text-4xl">Face Assist</h1>
          <div className="mt-4 space-y-3.5">
            <p>
              Accurate face recognition begins with high-quality scans. However,
              most users need help finding the optimal scanning pose.
            </p>
            <p>
              Face assist displays movement queues on the screen below a
              progress bar. These queues help users find the optimal scan pose
              and reduce the burden on our recognition algorithm.
            </p>
          </div>
        </div>
        <PopSquare>
          <div className="flex flex-col md:flex-row spac-x-4">
            <Image
              width={400}
              height={400}
              src={"/demos/assistDemo.gif"}
              alt={"Demo of face assist."}
              className="mx-auto rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
            />
            <div className="mt-2 md:pl-2 md:mt-0">
              <h1 className="text-3xl group-hover:text-green-400 transition-color duration-500">
                Face Assist
              </h1>
              <p>Face assist helps orient the user to capture the best shot.</p>
            </div>
          </div>
        </PopSquare>
        <div className="my-8 space-y-3.5">
          <h3 className="text-3xl text-gray-600">How it works</h3>
          <p>
            Face assist compares the current head position against an ideal
            bounding box. The ideal bounding box is centered and corresponds to
            a depth between 10 and 18 inches. We decided on these parameters
            based on feedback from five early testers.
          </p>
          <p>
            We compute lateral, height, and depth discrepancies. These three
            axes allow us to determine the optimal move needed to increase scan
            quality.{" "}
            <Link
              href="https://github.com/KryptikApp/faze/blob/main/src/assist/index.ts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-500 transition-color duration-300"
            >
              The algorithm
            </Link>{" "}
            runs at the maximum framerate to provide continuous feedback.
          </p>
        </div>
      </div>
      {/* Lighting Detection */}
      <div className="my-12">
        <div className="my-8 space-y-3.5">
          <h1 className="text-4xl">Lighting Detection</h1>
          <p className="mt-4">
            Poor lighting leads to poor recognition. Face bounding boxes and
            landmark detection become jittery in the dark. We built a simple
            algorithm to detect and notify users if the scanning scene is too
            dark. If the scene is too dark,{" "}
            <span className="text-red-500 font-semibold">Too Dark</span> will be
            displayed and no scans will be captured.
          </p>
        </div>
        <PopSquare>
          <div className="flex flex-col md:flex-row spac-x-4">
            <Image
              width={400}
              height={400}
              src={"/demos/features/darkness.gif"}
              alt={"Demo of face assist."}
              className="mx-auto rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
            />
            <div className="mt-2 md:pl-2 md:mt-0">
              <h1 className="text-3xl group-hover:text-green-400 transition-color duration-500">
                Lighting Detection
              </h1>
              <p>
                Lighting assist helps ensure scans have high quality lighting.
              </p>
            </div>
          </div>
        </PopSquare>
        <div className="my-8 space-y-3.5">
          <h3 className="text-3xl text-gray-600">How it works</h3>
          <p>
            Our algorithm detects poor lighting by summing the intensity of each
            pixel in a frame. The resulting brightness score is between 0
            (black) and 255 (white). Lighting is quantified every half second,
            with the algorithm shown below.
          </p>
          {/* show  formatted code output of the function getVideoBrightness */}
          <div className="bg-gray-800 rounded-xl p-2 my-8 hover:bg-gradient-to-r hover:from-green-500/90 hover:via-sky-500/90 hover:to-green-400/90">
            <pre className="text-white text-md">
              <code className="typescript">
                {` export function computeVideoBrightness(video: HTMLVideoElement): number {
 
  // CANVAS AND IMAGE FETCHING CODE REMOVED FOR BREVITY

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
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
      {/* liveness detection */}
      <div className="my-12">
        <div className="my-8 space-y-3.5">
          <h1 className="text-4xl">Liveness Detection</h1>
          <div className="mt-4">
            <p>
              Liveness detection ensures users are attentive and human. In
              addition, the liveness requirement prevents static photos and
              videos from spoofing actual human beings.
            </p>
          </div>
        </div>
        <PopSquare>
          <div className="flex flex-col md:flex-row spac-x-4">
            <Image
              width={400}
              height={400}
              src={"/demos/features/liveness.gif"}
              alt={"Demo of face assist."}
              className="mx-auto rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
            />
            <div className="mt-2 md:pl-2 md:mt-0">
              <h1 className="text-3xl group-hover:text-green-400 transition-color duration-500">
                Liveness Score
              </h1>
              <p>
                No scans are captured if the face fails liveness challenges.
              </p>
            </div>
          </div>
        </PopSquare>
        <div className="my-8 space-y-3.5">
          <h3 className="text-3xl text-gray-600">How it works</h3>
          <p>
            Our system relies on a challenge and response. First, the server
            requests a blink at a random time. Then, we verify liveness If the
            user blinks within the required timeframe.
          </p>

          <p>
            The production branch uses a passive version of this system. Users
            must blink a certain number of times before we collect any scans.{" "}
          </p>
          <p>
            Blink detection relies on the{" "}
            <Link
              href="https://github.com/KryptikApp/faze/tree/main/src/auth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-500 transition-color duration-300"
            >
              eye-aspect ratio
            </Link>
            , which we calculate using the code below.
          </p>
        </div>
        {/* show  formatted code output of the function EAR */}
        <div className="bg-gray-800 rounded-xl p-2 my-8 hover:bg-gradient-to-r hover:from-green-500/90 hover:via-sky-500/90 hover:to-green-400/90">
          <pre className="text-white text-md">
            <code className="typescript">
              {`   getEAR(): number {
    const midPointTop = calculateMidpoint(this.p2, this.p3);
    const midPointBottom = calculateMidpoint(this.p5, this.p6);
    const verticalDistance = calculateDistance(midPointTop, midPointBottom);
    const horizontalDistance = calculateDistance(this.p1, this.p4);
    return verticalDistance / horizontalDistance;
  }`}
            </code>
          </pre>
        </div>
      </div>
      {/* liveness detection */}
      <div className="my-12">
        <div className="my-8 space-y-3.5">
          <h1 className="text-4xl">Smart Login</h1>
          <div className="mt-4">
            <p>
              Every logged-in user is issued refresh and access tokens that
              authenticate access to user resources. We store both tokens in a
              JSON Web Token (JWT), which middleware verifies on every request.
            </p>
          </div>
        </div>
        <PopSquare>
          <div className="flex flex-col md:flex-row spac-x-4">
            <Image
              width={400}
              height={400}
              src={"/demos/features/smartlogin.gif"}
              alt={"Demo of face assist."}
              className="mx-auto rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
            />
            <div className="mt-2 md:pl-2 md:mt-0">
              <h1 className="text-3xl group-hover:text-green-400 transition-color duration-500">
                Smart Login
              </h1>
              <p>Users with valid JWT tokens are automatically logged in.</p>
            </div>
          </div>
        </PopSquare>
        <div className="my-8 space-y-3.5">
          <h3 className="text-3xl text-gray-600">How it works</h3>
          <p>
            We automatically log in users if a valid JWT exists on the client.
            Automatic login minimizes user burden and reduces the time spent
            verifying identity.
          </p>
          {/* link that open sin new tab */}
          <p>
            The complete authentication code can be viewed{" "}
            <Link
              href="https://github.com/KryptikApp/faze/tree/main/src/auth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-500 transition-color duration-300"
            >
              here
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="space-y-3.5">
        <h1 className="text-4xl font-bold">Recognition</h1>
        <p>
          Faze ID leverages Tensorflow to run machine learning models on the
          client. We use a pre-trained model provided by Google to estimate 468
          3-dimensional face landmarks. The landmarks can represent key facial
          features like eyes, nose, mouth, and ears.
        </p>
        <p>
          However, each landmark provides few distinguishing facial features.
          Therefore, we apply principal component analysis to extract a linear
          combination of face landmarks with the highest variance.
        </p>
        <p>
          The PCA was fit on landmarks extracted from over 13,000 faces
          collected from the web. After fitting the PCA, we discovered the first
          20 principal components explain over 90% of the variance. However,
          Faze ID uses all 100 principal components since the low variance
          components may provide distinguishing features.
        </p>
        {/* centered image with rounded corners */}
        <div className="flex justify-center">
          <Image
            width={800}
            height={400}
            src={"/data/pcaCumulative.png"}
            alt={"Face landmarks."}
            className="rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
          />
        </div>
        <p>
          The authentication process has two phases: registration and
          verification.
        </p>
        <p>
          <span className="font-bold">Registration.</span> The registration
          phase collects ten face encodings. Each encoding consists of 100
          principal components extracted from the new user’s facial landmarks.
          Scans are collected at least .5 seconds apart to provide variation
          between encodings. In addition, we require each scan to have a quality
          score greater than 80.
        </p>
        <p>
          Once ten scans have been collected; we submit the encodings to an
          authentication server for storage alongside a unique user identifier.
          Overall, the registration phase takes less than twenty seconds.
        </p>
        <p>
          <span className="font-bold">Verification.</span> The verification
          phase attempts to match a face encoding to the correct user
          identifier. When a user wants to log in, we collect a single face
          scan. We ensure the quality of this scan by requiring a quality score
          of greater than 90.
        </p>
        <p>
          The new encoding is computed on the client and submitted to the server
          (with a UID) for verification. Finally, we run a nearest neighbors
          algorithm on the server based on the Euclidean distance between
          encodings.
        </p>
        <p>
          If seven of the ten nearest neighbors have the same UID as the
          submitted scan, we have a match and create a new JWT for the user.
          Overall, the verification phase takes less than ten seconds.
        </p>
        <PopSquare>
          <div className="flex flex-col md:flex-row spac-x-4">
            <Image
              width={400}
              height={400}
              src={"/demos/features/login.gif"}
              alt={"Demo of face assist."}
              className="mx-auto rounded-xl p-1 bg-gray-500 dark:bg-gray-700 hover:bg-green-400 dark:hover:bg-green-400 transition-color duration-300"
            />
            <div className="mt-2 md:pl-2 md:mt-0">
              <h1 className="text-3xl group-hover:text-green-400 transition-color duration-500">
                Verification
              </h1>
              <p>
                Log in requests are verified against the registration set using
                a nearest neighbors algorithm.
              </p>
            </div>
          </div>
        </PopSquare>
        <h1 className="text-4xl font-bold">Challenges </h1>
        <p>
          <span className="font-bold">Low accuracy.</span> After limited testing
          with a few close friends, we found our current recognition system
          achieves ~60% recognition accuracy. The low accuracy is unacceptable
          for a production authentication system.
        </p>
        <p>
          <span className="font-bold">High-Dimensional Overlap.</span> Our
          original plan was to use locality-sensitive hashing on each encoding.
          LSH would enable near-constant time verification and enhance privacy.
          We even built an open-source NPM package,{" "}
          <Link
            href="https://github.com/jettblu/hyperFuzz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-500 transition-color duration-300"
          >
            hyperFuzz
          </Link>
          . However, our implementation relies on Jacard distance, which does
          not work for continuous values in high dimensional space.
        </p>
        <p>
          <span className="font-bold">Biased Dataset.</span> The data used to
          fit our PCA fails to represent all subgroups. Per the data source,”
          There are very few children, no babies, very few people over 80, and a
          relatively small proportion of women. In addition, many ethnicities
          have minor representation or none at all.”
        </p>
        <h1 className="text-4xl font-bold">Conclusion</h1>
        <p>
          Our goal is to provide ‘plug and play’ authentication. Developers
          should be able to drop our open-source component into their
          application and immediately have access to face verification and Sybil
          resistance.
        </p>
        <p>
          Our next step is to improve model accuracy. We expect our current
          PCA-based approach to be insufficient, even with optimizations. An
          alternative solution is to train (or adopt) a lightweight TensorFlow
          model that can run on the client.
        </p>
        <p>
          While the current accuracy of Faze ID is low, we have produced several
          achievements:
        </p>
        <ul className="list-disc list-inside space-y-3.5">
          <li>
            <span className="font-bold">Fast login.</span> On average, it takes
            users less than ten seconds to authenticate with Faze ID.
          </li>
          <li>
            <span className="font-bold">Face Assist.</span> We have developed
            several assist features that help our system collect high-quality
            face scans.
          </li>

          <li>
            <span className="font-bold">Authentication Server.</span> Faze
            includes a custom authentication server that relies on
            industry-standard access tokens.
          </li>
          <li>
            <span className="font-bold">Easy Deployment.</span> Developers can
            integrate Faze ID with the single line of code shown below.
          </li>
        </ul>
      </div>
    </div>
  );
}
