import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setShowMobileMenu(false);
    navigate("/");
  }

  return (
    <header className={showMobileMenu ? "show-mobile-menu" : ""}>
      <nav className="navbar">
        <Link className="logo" to="/">
          IronHeaven<span>.</span>
        </Link>
        <ul className="menu-links">
          <span
            id="close-menu-btn"
            className="material-symbols-outlined"
            onClick={() => setShowMobileMenu(false)}
          >
            close
          </span>
          <li>
            <Link to="/" onClick={() => setShowMobileMenu(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setShowMobileMenu(false)}>
              About Us
            </Link>
          </li>
          <li>
            <Link to="/#contact" onClick={() => setShowMobileMenu(false)}>
              Contact Us
            </Link>
          </li>

          {user ? (
            <>
              <li className="navbar-username">{user.name}</li>
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={() => setShowMobileMenu(false)}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button className="navbar-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setShowMobileMenu(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
        <span
          id="hamburger-btn"
          className="material-symbols-outlined"
          onClick={() => setShowMobileMenu(true)}
        >
          menu
        </span>
      </nav>
    </header>
  );
}
