import Navbar from "./components/Navbar"

export default function Home() {
  return (
    <div>
      <div className="absolute inset-0 bg-cover bg-no-repeat -z-10" style={{backgroundImage: "url('/background.webp')"}}></div>
      <div className="absolute inset-0 bg-black opacity-70 -z-10"></div>
      <Navbar/>
    </div>
  );
}
