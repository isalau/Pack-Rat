import { Outlet } from 'react-router-dom';
import MainNav from './MainNav';

const ProtectedLayout = () => {
  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>
      <MainNav />
    </div>
  );
};

export default ProtectedLayout;
