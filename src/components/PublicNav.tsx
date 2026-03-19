import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import "./styles/PublicNav.css"; // Add this import

const PublicNav = () => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/login/student", label: "Student Portal", isPortal: true },
    { to: "/login/masomo", label: "Masomo Portal", isPortal: true },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="nav-container"
    >
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          TRESPICS
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="menu-icon" />
          ) : (
            <Menu className="menu-icon" />
          )}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${pathname === link.to ? "active" : ""} ${link.isPortal ? "portal" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default PublicNav;
