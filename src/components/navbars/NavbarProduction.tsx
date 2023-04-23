import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import Menu, { MenuItem } from "../menu/menu";
import toast from "react-hot-toast";

const NavbarProduction: NextPage = () => {
  const router = useRouter();

  function handleLogoTapped() {
    // pass for now
    // toast("Hey there!");
  }

  return (
    <Menu>
      <MenuItem>
        <Link href="../privacy">
          <span>Privacy</span>
        </Link>
      </MenuItem>
      <MenuItem>
        <Link href="/" onClick={handleLogoTapped}>
          <Image
            width={40}
            height={40}
            src="/fazeLogo.png"
            alt={"Face mesh."}
          />
        </Link>
      </MenuItem>
      <MenuItem>
        <Link
          href="https://github.com/KryptikApp/faze"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Code</span>
        </Link>
      </MenuItem>
    </Menu>
  );
};

export default NavbarProduction;
