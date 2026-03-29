import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();
  const isDriver = user?.user_type === "driver";
  const isAdmin = user?.user_type === "admin";
  const isCustomer = user?.user_type === "customer";
  const showListVehicle = isDriver ;

  const isLoggedIn = !!user?.username;
  const navigate = useNavigate();
  const Layout = ({ children, user, hideNavbar }) => {
  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="bg-[#0f0f0f] text-[#f0ede8] min-h-screen flex flex-col"
    >
      {/* Navbar */}
      {!hideNavbar && <Navbar user={user} />}

      {/* Page content */}
      <main className="flex-1 w-full ">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] mt-auto">
        ...
      </footer>
    </div>
  );
};
  const handleLogout = async () => {
    setOpen(false);
    localStorage.removeItem('user');
    try {
      await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '' },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/');
  };
const homePath = !isLoggedIn 
  ? "/" 
  : user?.user_type === 'admin'
  ? "/admin"
  : isCustomer 
  ? "/viewer-homepage" 
  : "/driver-homepage";  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const displayName = user?.full_name || user?.username || "Menu";
  

  return (
    <nav
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-[#1e1e1e]"
    >
      <div className="flex items-center justify-between h-[60px] px-8 w-full">

        {/* Logo — far left */}
        <Link to={homePath} className="flex items-center no-underline shrink-0">
          <img
            src="/img/sawari_white.png"
            alt="Sawari"
            className="h-10 w-auto"
            style={{ filter: 'brightness(0) saturate(100%) invert(80%) sepia(60%) saturate(500%) hue-rotate(5deg) brightness(105%)' }}
          />
        </Link>

        {/* Customer nav links — center */}
        <div className="flex items-center gap-6 flex-1 px-10">
          {isCustomer && (
            <Link
              to="/my-bookings"
              className="flex items-center gap-1.5 text-sm transition-colors no-underline"
              style={{ color: pathname === '/my-bookings' ? '#e8c84a' : '#555' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              My Bookings
            </Link>
          )}
        </div>

        {/* Dropdown pill */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full pl-4 pr-1.5 py-1 hover:border-[#444] transition-colors"
          >
            {isLoggedIn && (
              <span className="text-xs text-[#888]">{displayName}</span>
            )}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: isLoggedIn ? "#e8c84a" : "#2a2a2a", color: isLoggedIn ? "black" : "#888" }}
            >
              {isLoggedIn ? initial : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl z-20">

                {showListVehicle && (
                  <>
                    <div className="p-1.5">
                      <p className="text-[10px] text-[#444] uppercase tracking-widest px-3 py-1">
                        Manage
                      </p>
                      <Link
                        to="/register-vehicle"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#e8c84a] bg-[#1a1800] hover:bg-[#222000] text-sm transition-colors no-underline"
                      >
                        + List Vehicle
                      </Link>
                    </div>
                    <hr className="border-[#1e1e1e] m-0" />
                  </>
                )}

                <div className="p-1.5">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#c0513a] hover:bg-[#1e1212] text-sm transition-colors w-full text-left"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#aaa] hover:bg-[#1e1e1e] hover:text-white text-sm transition-colors no-underline"
                    >
                      Login
                    </Link>
                  )}
                </div>


              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};


const Layout = ({ children, user }) => {
  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="bg-[#0f0f0f] text-[#f0ede8] min-h-screen flex flex-col"
    >
      {/* Navbar */}
      <Navbar user={user} />

      {/* Page content */}
      <main className="flex-1 w-full ">
        {children}
      </main>
    </div>
  );
};

export default Layout;
