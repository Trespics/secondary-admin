import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  CreditCard,
  FileText,
  Activity,
  LogOut,
  Settings,
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  MapPin,
  UserPlus,
  Layers,
  ShieldCheck,
  BarChart3,
  Bell,
  Home,
  Menu,
  X,
} from "lucide-react";
import "./styles/PortalLayout.css";

interface SidebarProps {
  type: "student" | "masomo";
  isOpen?: boolean;
  onClose?: () => void;
}

const studentLinks = [
  { to: "/student", icon: User, label: "Profile" },
  { to: "/student/fees", icon: CreditCard, label: "Fees" },
  { to: "/student/results", icon: FileText, label: "Results" },
  { to: "/student/activities", icon: Activity, label: "Activities" },
];

const masomoLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/school", icon: Building2, label: "School Info" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/classes", icon: GraduationCap, label: "Grades" },    
  { to: "/admin/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/admin/teacher-assignments", icon: MapPin, label: "Link Teachers" },
  { to: "/admin/enrollment", icon: UserPlus, label: "Enrollment" },
  // { to: "/admin/cbc-curriculum", icon: Layers, label: "CBC Framework" },
  { to: "/admin/content", icon: ShieldCheck, label: "Approval" },    
  { to: "/admin/reports", icon: BarChart3, label: "Reports" },
  { to: "/admin/notifications", icon: Bell, label: "Broadcast" },
  { to: "/admin/profile", icon: User, label: "Profile" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const PortalSidebar = ({ type, isOpen: propIsOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const links = type === "student" ? studentLinks : masomoLinks;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen && onClose) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleMobileMenu}
        />
      )}

      <aside 
        className={`portal-sidebar ${type} ${isMobile ? 'mobile' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <Home className="header-icon" />
          <span className="header-title">TRESPICS</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <link.icon className="nav-icon" />
                <span className="nav-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="logout-icon" />
          <span className="logout-label">Logout</span>
        </button>
      </aside>
    </>
  );
};

export default PortalSidebar;