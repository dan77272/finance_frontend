import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div>
      <div
        className="absolute inset-0 bg-cover bg-no-repeat -z-10 min-h-[500px]"
        style={{ backgroundImage: "url('/background.webp')" }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-70 -z-10 min-h-[500px]"></div>
      <Navbar />
      <div className="flex flex-col justify-center items-center mt-32 gap-10 px-4">
        <p className="text-white text-2xl md:text-4xl text-center">
          Take control of your personal finances with ease.
        </p>
        <p className="text-white text-lg md:text-xl text-center">
          Track expenses, set budgets, and achieve your financial goals—all in one place.
        </p>
        <Link href={'/register'} className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
          Get Started
        </Link>
      </div>
    </div>
  );
}
