import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from '../component/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ user }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const isDriver   = user?.user_type === "driver";
  const isAdmin    = user?.user_type === "admin";
  const isCustomer = user?.user_type === "customer";
  const isLoggedIn = !!user?.username;

  const homePath = !isLoggedIn
    ? "/"
    : isAdmin
    ? "/admin"
    : isCustomer
    ? "/viewer-homepage"
    : "/driver-homepage";

  const initial     = user?.username?.[0]?.toUpperCase() ?? "?";
  const displayName = user?.full_name || user?.username || "Menu";

  const handleLogout = async () => {
    setOpen(false);
    localStorage.removeItem('user');
    try {
      await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/');
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b border-theme"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: 'var(--bg-primary)',
      }}
    >
      <div className="flex items-center justify-between h-[60px] px-8 w-full">

        {/* Logo */}
        <Link to={homePath} className="flex items-center no-underline shrink-0">
          <img
            src="/img/sawari_white.png"
            alt="Sawari"
            className="h-16 w-auto transition-all"
            style={{
              filter: isDark
                ? 'brightness(0) saturate(100%) invert(80%) sepia(60%) saturate(500%) hue-rotate(5deg) brightness(105%)'
                : 'brightness(0)',  // turns it pure black in light mode
            }}
          />
        </Link>

        {/* Customer nav links */}
        <div className="flex items-center gap-6 flex-1 px-10">
          {isCustomer && (
            <Link
              to="/my-bookings"
              className="flex items-center gap-1.5 text-sm transition-colors no-underline"
              style={{ color: pathname === '/my-bookings' ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              My Bookings
            </Link>
          )}
        </div>

        {/* Right side — Theme toggle + dropdown */}
        <div className="flex items-center gap-3">

          {/* ✅ ThemeToggle now actually used */}
          <ThemeToggle />

          {/* Dropdown pill */}
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 border rounded-full pl-4 pr-1.5 py-1 transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-hover)',
              }}
            >
              {isLoggedIn && (
                <span className="text-xs text-theme-secondary">{displayName}</span>
              )}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: isLoggedIn ? 'var(--accent)' : 'var(--border-hover)',
                  color: isLoggedIn ? 'black' : 'var(--text-secondary)',
                }}
              >
                {isLoggedIn ? initial : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
            </button>

            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div
                  className="absolute right-0 mt-2 w-52 border rounded-xl overflow-hidden shadow-2xl z-20"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-hover)',
                  }}
                >
                  {isDriver && (
                    <>
                      <div className="p-1.5">
                        <p className="text-[10px] text-theme-muted uppercase tracking-widest px-3 py-1">
                          Manage
                        </p>
                        <Link
                          to="/register-vehicle"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors no-underline"
                          style={{ color: 'var(--accent)', background: 'var(--bg-tertiary)' }}
                        >
                          + List Vehicle
                        </Link>
                      </div>
                      <hr style={{ borderColor: 'var(--border)' }} className="m-0" />
                    </>
                  )}

                  <div className="p-1.5">
                    {isLoggedIn ? (
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left"
                        style={{ color: 'var(--error-text)' }}
                      >
                        Logout
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors no-underline text-theme-secondary"
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
      </div>
    </nav>
  );
};


// ── Layout ────────────────────────────────────────────────────────────
const Layout = ({ children, user, hideNavbar }) => {
  return (
    <div
      className="min-h-screen flex flex-col text-theme-primary"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {!hideNavbar && <Navbar user={user} />}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
