import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import PortalSidebar from "./PortalSidebar";
import { Menu, X } from "lucide-react";
import "./styles/PortalLayout.css";

interface PortalLayoutProps {
  children: ReactNode;
  type: "student" | "masomo";
}

const PortalLayout = ({ children, type }: PortalLayoutProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={`/login/${type}`} replace />;
  }

  return (
    <div className={`portal-layout ${type}`}>
      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`mobile-overlay ${isSidebarOpen ? "visible" : ""}`} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <PortalSidebar 
        type={type} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className={`portal-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile Header */}
        <header className="mobile-header">
          <button 
            className="menu-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="mobile-logo">FloranteHub</span>
          <div className="header-avatar">
            <span className="avatar-initials">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="desktop-header">
          <div className="header-left">
            <h1 className="page-title">Welcome back, {user?.name || 'User'}</h1>
            <p className="page-subtitle">
              {type === 'student' ? 'Track your academic progress' : 'Access your learning materials'}
            </p>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <span className="user-name">{user?.name || 'User'}</span>
              <div className="user-avatar">
                <span className="avatar-initials">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-wrapper">
          <div className="content-container">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;