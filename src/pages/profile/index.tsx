import { deleteUser, getActiveUser, logout } from "@/auth/user";
import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  async function handleLogout() {
    try {
      setIsLoading(true);
      const res = await logout();
      setIsLoading(false);
      router.push("/");
      toast.success("Logged out successfully!");
    } catch (err) {
      console.warn(err);
      setIsLoading(false);
    }
  }
  async function handleDelete() {
    try {
      setIsLoading(true);
      const res = await deleteUser();
      if (!res) {
        toast.error("Failed to delete account.");
        return;
      }
      setIsLoading(false);
      router.push("/");
      toast.success("Deleted account.");
    } catch (err) {
      console.warn(err);
      setIsLoading(false);
    }
  }
  async function handleGetUser() {
    const newUser = await getActiveUser();
    setUser(newUser);
  }
  function handleSurprise() {
    toast.success("Happy May!");
  }
  useEffect(() => {
    handleGetUser();
  }, []);
  return (
    <div className="max-w-2xl min-h-[40vh] mx-auto mt-[2vh] rounded-xl">
      {/* <DynamicHeader /> */}
      <div className="text-left my-10 group">
        <h1 className="text-3xl mb-2 transition-transform duration-300">
          Profile
        </h1>
        <p className="text-xl transition-transform duration-300 text-gray-500">
          View and update your information.
        </p>
        {user && (
          <div>
            <div className="flex flex-col mt-4 space-y-4">
              <div className="flex flex-col">
                <p className="text-md text-gray-500">Name</p>
                <p className="text-xl font-semibold py-1 px-2 bg-gray-100/10 rounded-lg w-fit hover:bg-gray-100/20 transition-colors">
                  {user.username}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-md text-gray-500">Created</p>
                <p
                  className="text-xl font-semibold py-1 px-2 bg-gray-100/10 rounded-lg w-fit hover:bg-gray-100/20 transition-colors hover:cursor-pointer"
                  onClick={handleSurprise}
                >
                  {/* show pretty date string */}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-2 mb-6 w-full h-[2px] bg-gray-500/50" />
            <div className="flex flex-col space-y-4">
              <div
                className={`w-fit px-4 rounded-xl bg-green-500/50 hover:bg-green-500/90 transition-color duration-500 text-lg font-semibold text-center py-2 hover:cursor-pointer flex flex-row space-x-2 place-items-center justify-center ${
                  isLoading && "disabled"
                }`}
                onClick={handleLogout}
              >
                <span className="">Logout</span>
                {/* loading circle */}
                {isLoading && (
                  <div className="w-6 h-6 border-t-2 border-gray-200 rounded-full animate-spin"></div>
                )}
              </div>
              <div
                className={`w-fit px-4 rounded-xl bg-red-500/50 hover:bg-red-500/90 transition-color duration-500 text-lg font-semibold text-center py-2 hover:cursor-pointer flex flex-row space-x-2 place-items-center justify-center ${
                  isLoading && "disabled"
                }`}
                onClick={handleDelete}
              >
                <span className="">Delete</span>
                {/* loading circle */}
                {isLoading && (
                  <div className="w-6 h-6 border-t-2 border-gray-200 rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
