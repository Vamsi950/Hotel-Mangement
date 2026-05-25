import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';

function Navigation() {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0px_4px_20px_rgba(26,54,93,0.05)] h-20 flex items-center">
      <nav className="flex justify-between items-center px-lg w-full max-w-container-max mx-auto">
        <Link to="/" className="font-headline-md text-headline-md font-extrabold text-primary select-none">
          LuxeStay
        </Link>
        
        <div className="hidden md:flex items-center gap-lg">
          <Link className="font-body-md text-body-md text-primary font-bold transition-colors" to="/">Discover</Link>
          <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors" to="/hotels">Destinations</Link>
          {user && !isAdmin && <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors" to="/profile">My Bookings</Link>}
        </div>

        <div className="flex items-center gap-md">
          {user && isAdmin && (
            <Link to="/admin" className="hidden lg:block font-label-uppercase text-label-uppercase text-primary border border-primary px-md py-xs rounded-lg hover:bg-primary/5 transition-all">
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-sm">
              <span className="text-body-sm font-semibold text-secondary">
                Hello, <strong className="text-primary">{user.name.split(' ')[0]}</strong>
              </span>
              <button onClick={handleLogout} className="font-label-uppercase text-label-uppercase text-white bg-primary px-md py-xs rounded-lg hover:brightness-110 transition-all active:scale-95">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="font-label-uppercase text-label-uppercase text-white bg-primary px-md py-xs rounded-lg hover:brightness-110 transition-all active:scale-95">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-primary w-full py-xl mt-xl text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg px-lg w-full max-w-container-max mx-auto">
        <div className="col-span-1">
          <span className="font-headline-sm text-headline-sm font-bold text-on-primary">LuxeStay</span>
          <p className="font-body-sm text-body-sm text-secondary-fixed/80 mt-md">
            Elevating the standard of luxury travel through curated selections and institutional excellence.
          </p>
        </div>
        <div>
          <h5 className="text-on-primary font-bold mb-md">Company</h5>
          <ul className="flex flex-col gap-base">
            <li><a className="font-body-sm text-body-sm text-secondary-fixed/80 hover:text-tertiary-fixed transition-colors" href="#">About Us</a></li>
            <li><a className="font-body-sm text-body-sm text-secondary-fixed/80 hover:text-tertiary-fixed transition-colors" href="#">Careers</a></li>
            <li><a className="font-body-sm text-body-sm text-secondary-fixed/80 hover:text-tertiary-fixed transition-colors" href="#">Partner With Us</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-on-primary font-bold mb-md">Resources</h5>
          <ul className="flex flex-col gap-base">
            <li><a className="font-body-sm text-body-sm text-secondary-fixed/80 hover:text-tertiary-fixed transition-colors" href="#">Help Center</a></li>
            <li><a className="font-body-sm text-body-sm text-secondary-fixed/80 hover:text-tertiary-fixed transition-colors" href="#">Contact Us</a></li>
            <li><a className="font-body-sm text-body-sm text-secondary-fixed/80 hover:text-tertiary-fixed transition-colors" href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-on-primary font-bold mb-md">Newsletter</h5>
          <p className="font-body-sm text-body-sm text-secondary-fixed/80 mb-md">Subscribe for exclusive offers and travel insights.</p>
          <div className="flex gap-xs">
            <input className="bg-white/10 border-none rounded-lg px-md py-base text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary-fixed w-full" placeholder="Email address" type="email"/>
            <button className="bg-[#FF7A00] text-white p-base rounded-lg material-symbols-outlined">send</button>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-lg mt-xl pt-lg border-t border-white/10 text-center">
        <p className="font-body-sm text-body-sm text-secondary-fixed/80">© {new Date().getFullYear()} LuxeStay Global. All rights reserved.</p>
      </div>
    </footer>
  );
}

function MainApp() {
  const location = useLocation();
  const isAdminPath = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {!isAdminPath && <Navigation />}
      <div className={`flex-grow ${isAdminPath ? '' : 'pt-20'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<HotelList />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
}
