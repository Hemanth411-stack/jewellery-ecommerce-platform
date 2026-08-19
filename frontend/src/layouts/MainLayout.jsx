import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer.jsx";
import Navbar from "../components/Navbar/Navbar.jsx";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-pearl">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
