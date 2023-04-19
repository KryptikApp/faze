import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import Menu, { MenuItem } from "../menu/menu";

const NavbarProduction: NextPage = () => {
  const router = useRouter();

  return (
    <Menu>
      <MenuItem>
        <Link href="../about">
          <span
            className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 dark:hover:bg-gray-300 dark:hover:text-black transition-colors duration-300 ${
              router.pathname == "/about" ? "font-bold" : ""
            } `}
          >
            About
          </span>
        </Link>
      </MenuItem>
      <MenuItem>
        <Link href="../members">
          <span
            className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 dark:hover:bg-gray-300 dark:hover:text-black transition-colors duration-300 ${
              router.pathname == "/explore" ? "font-bold" : ""
            }`}
          >
            Test
          </span>
        </Link>
      </MenuItem>
    </Menu>
  );
};

export default NavbarProduction;
