import Image from "next/image";

export default function Profile() {
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
      </div>
    </div>
  );
}
