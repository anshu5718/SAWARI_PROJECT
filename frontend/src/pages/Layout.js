import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from '../component/ThemeToggle';

// ── SVG Icons ─────────────────────────────────────────────────────────
const Icons = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  Car: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>
      <path d="M5 17H3v-6l2-5h10l2 5v6h-2M5 17h10"/>
      <path d="M3 6h18"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  PlusCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v8M8 12h8"/>
    </svg>
  ),
  Edit: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────
const Navbar = ({ user, onToggleSidebar, sidebarOpen }) => {
  const isLoggedIn = !!user?.username;

  const homePath = !isLoggedIn
    ? "/"
    : user?.user_type === "admin"
    ? "/admin"
    : user?.user_type === "customer"
    ? "/viewer-homepage"
    : "/driver-homepage";

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        display: "flex",
        height: "55px",
        alignItems: "stretch",
        flexShrink: 0,
        background: "var(--bg-tertiary)",     // ← Added
        borderBottom: "1px solid var(--border)", // ← Moved here
      }}
    >
      {/* ── Logo block ── */}
      <Link
        to={homePath}
        onClick={isLoggedIn ? onToggleSidebar : undefined}
        className="no-underline flex items-center shrink-0 gap-4"
        style={{
          background: "var(--accent)",
          width: "240px",
          minWidth: "240px",
          transition: "width 0.25s ease, min-width 0.25s ease, clip-path 0.3s ease",
          padding: "10px",
          clipPath: !sidebarOpen 
            ? "polygon(0% 0%, 85% 0%, 65% 100%, 0% 100%)"
            : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      >
        <img
          src="/img/sawari_white.png"
          alt="Sawari"
          style={{ 
            height: "62px", 
            width: "auto", 
            filter: "brightness(0)",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-15px)",
            transition: "transform 0.3s ease"
          }}
        />
      </Link>

      {/* ── Right strip ── */}
      <div
        style={{
          flex: 1,
          // background removed (now on parent nav)
          display: "flex",
          alignItems: "center",
          paddingRight: "20px",
          // borderBottom removed (now on parent nav)
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
          {/* ── Right strip — Now uses theme variables ── */}
  
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            {isLoggedIn && (
              <span style={{
                background: "rgba(232,200,74,0.12)",
                color: "var(--accent)",
                border: "1px solid rgba(232,200,74,0.25)",
                borderRadius: "20px",
                padding: "4px 14px",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                {user?.user_type}
              </span>
            )}

            <ThemeToggle />

            {isLoggedIn && (
              <Link
                to="/profile/edit"
                className="no-underline"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  color: "#111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "15px",
                  flexShrink: 0,
                }}
              >
                {user?.username?.[0]?.toUpperCase() || "U"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();
  const isDriver   = user?.user_type === "driver";
  const isAdmin    = user?.user_type === "admin";
  const isCustomer = user?.user_type === "customer";

  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/admin" && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  const handleLogout = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("theme");
    fetch("http://localhost:8000/api/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "" },
    }).catch(() => {});
    window.location.href = "/";
  };

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      onClick={() => window.innerWidth < 768 && onClose()}
      className="no-underline"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        fontSize: "13.5px",
        fontWeight: isActive(to) ? "600" : "400",
        background: isActive(to) ? "var(--accent)" : "transparent",
        color: isActive(to) ? "#111" : "var(--text-primary)",
        transition: "background 0.15s, color 0.15s",
        marginBottom: "2px",
      }}
    >
      <span style={{ opacity: isActive(to) ? 1 : 0.65, display: "flex" }}>
        <Icon />
      </span>
      {children}
    </Link>
  );

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: "55px",
        paddingTop: "25px",
        height: "calc(100vh - 55px)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: isOpen ? "1px solid var(--border)" : "none",
        width: isOpen ? "240px" : "0px",
        minWidth: isOpen ? "240px" : "0px",
        transition: "width 0.25s ease, min-width 0.25s ease, visibility 0.25s, background 0.2s",
        visibility: isOpen ? "visible" : "hidden",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto" }}>
        {isCustomer && <NavLink to="/viewer-homepage" icon={Icons.Home}>Home</NavLink>}
        {isDriver   && <NavLink to="/driver-homepage" icon={Icons.Home}>Home</NavLink>}
        {isAdmin    && <NavLink to="/admin"           icon={Icons.Home}>Dashboard</NavLink>}

        {isCustomer && <NavLink to="/my-bookings"     icon={Icons.Calendar}>My Bookings</NavLink>}

        {isDriver && (
          <>
            <NavLink to="/register-vehicle" icon={Icons.PlusCircle}>Register Vehicle</NavLink>
            <NavLink to="/driver-bookings"  icon={Icons.Calendar}>Driver Bookings</NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin/vehicles" icon={Icons.Car}>Vehicles</NavLink>
            <NavLink to="/admin/users"    icon={Icons.Users}>Users</NavLink>
            <NavLink to="/admin/bookings" icon={Icons.Calendar}>Bookings</NavLink>
          </>
        )}
      </nav>

      {/* Profile card */}
      <Link
        to="/profile/edit"
        className="no-underline"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "0 10px 8px",
          padding: "10px 12px",
          borderRadius: "12px",
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          whiteSpace: "nowrap",
        }}
      >
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          flexShrink: 0,
          background: "var(--accent)",
          color: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
          fontSize: "15px",
        }}>
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {user?.full_name || user?.username}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>
            {user?.user_type}
          </p>
        </div>
        <span style={{ opacity: 0.4, color: "var(--text-primary)", flexShrink: 0 }}>
          <Icons.Edit />
        </span>
      </Link>

      <div style={{ padding: "10px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--error-text)",
            fontSize: "13px",
            padding: "8px 12px",
            borderRadius: "8px",
            width: "100%",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          <Icons.LogOut />
          Logout
        </button>
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────
const Layout = ({ children, user, hideNavbar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const isLoggedIn = !!user?.username;

  const handleOverlayClick = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {!hideNavbar && (
        <Navbar
          user={user}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {!hideNavbar && isLoggedIn && sidebarOpen && window.innerWidth < 768 && (
          <div
            style={{
              position: "fixed",
              top: "55px",
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 39,
              backdropFilter: "blur(4px)",
            }}
            onClick={handleOverlayClick}
          />
        )}

        {!hideNavbar && isLoggedIn && (
          <Sidebar
            user={user}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main
          style={{
            flex: 1,
            width: "100%",
            overflowY: "auto",
            background: "var(--bg-primary)",
            transition: "margin-left 0.25s ease, background 0.2s",
            marginLeft: (sidebarOpen && window.innerWidth >= 768) ? "240px" : "0px",
            position: (sidebarOpen && window.innerWidth < 768) ? "fixed" : "relative",
            top: (sidebarOpen && window.innerWidth < 768) ? "55px" : 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
