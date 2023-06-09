import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  progressPercent: number;
};

const ProgressBar: NextPage<Props> = (props) => {
  const { progressPercent } = { ...props };
  const progressval = useMotionValue(progressPercent);
  const width = useTransform<MotionValue<number>, string>(
    progressval,
    [0, 100],
    ["0%", "100%"]
  );
  useEffect(() => {
    progressval.set(progressPercent);
  }, [progressPercent]);
  return (
    <div className="w-[100%] border-t border-b">
      <motion.div
        id="progressBar"
        className="bg-gradient-to-r from-white to-green-600 h-10 text-gray-700 py-2"
        style={{
          width: width,
          backgroundColor: "#fff",
        }}
      >
        <span className="ml-[2%]">
          {progressPercent > 5 ? `${progressPercent.toFixed(2)}%` : ""}
        </span>
      </motion.div>
    </div>
  );
};

export default ProgressBar;
