import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  children: any;
};

const Menu: NextPage<Props> = (props) => {
  const [isMenuMobile, setMenuMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const { children } = { ...props };

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (window.innerWidth < 778) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    handleResize();
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 mx-auto mt-4 md:mt-6 p-2 w-fit rounded-full border bg-gray-100/60 dark:bg-gray-900/60 hover:border-green-700 transition-color duration-200`}
    >
      <div className="flex flex-row space-x-6 items-center px-6">
        {children}
      </div>
    </nav>
  );
};

export default Menu;

type MenuItemProps = {
  children: any;
};

export function MenuItem(props: MenuItemProps) {
  const { children } = { ...props };
  return (
    <div className="hover:cursor-pointer text-xl hover:text-green-400 transition-color duration-300">
      {" "}
      {children}
    </div>
  );
}
