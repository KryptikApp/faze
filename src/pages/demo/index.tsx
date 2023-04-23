import dynamic from "next/dynamic";

const DynamicHeader = dynamic(() => import("../../components/scan/Scanner"), {
  ssr: false,
  loading: () => <p className="text-center">Loading...</p>,
});

export default function Home() {
  return (
    <div className="max-w-2xl min-h-[40vh] mx-auto mt-[14vh] rounded-xl">
      <DynamicHeader />
    </div>
  );
}
