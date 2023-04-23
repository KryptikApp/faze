import {
  DeploymentUnitOutlined,
  SettingOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto mt-[4vh] rounded-xl">
      <div className="mb-4 group">
        <h1 className="text-5xl font-bold">Privacy</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Information we collect and why.
        </p>
      </div>
      <p className="text-xl">
        All biometric data is processed on your device and never leaves your
        browser. Our servers never see your face. Instead, we use data
        signatures and locality sensitive hashing to preserve your privacy.
      </p>
      <div className="rounded-xl group py-12 px-2 my-8  bg-gray-300/20 hover:bg-gray-300/50 dark:bg-gray-700/20 hover:dark:bg-gray-700/50 transition-color duration-500 border border-gray-400/20 dark:border dark:border-gray-800/50">
        <div className="flex flex-col items-center">
          {/* person outline icon */}
          <div className="px-2 pb-2 rounded-full border border-gray-300 dark:border-gray-500 w-fit text-center group-hover:border-green-500 group-hover:dark:border-green-500 transition-color duration-300">
            <UserDeleteOutlined
              size={20}
              className="group-hover:text-green-500 transition-color duration-300"
            />
          </div>
          <h2 className="text-xl font-semiboldn text-center group-hover:text-green-500 transition-color duration-300">
            Data Not Linked to You
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-300 max-w-sm text-center">
            The following data may be collected but it is not linked to your
            identity:
          </p>
        </div>
        <div className="flex flex-col space-y-1 mt-2 max-w-lg mx-auto">
          <div className="flex flex-row space-x-2 items-center">
            <DeploymentUnitOutlined size={20} className="text-xl" />
            <p className="text-md text-gray-600 dark:text-gray-300">
              Usage Data
            </p>
          </div>
          <div className="flex flex-row space-x-2 items-center">
            <SettingOutlined size={20} className="text-xl" />
            <p className="text-md text-gray-600 dark:text-gray-300">
              Diagnostics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
