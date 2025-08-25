import { Outlet } from "react-router-dom";
import MainNav from "./MainNav";

const ProtectedLayout = () => {
  return (
    <div className="app-container">
      <MainNav />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
