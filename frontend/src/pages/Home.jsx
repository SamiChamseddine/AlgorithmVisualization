import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Home = () => {
  return (
    <div>
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="bg-black">
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
