import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/Store";
import { logoutAdmin } from "@/features/auth/AuthSlice";
import logo from "@/assets/Logo/Logo.png";
import roundLogo from "@/assets/Logo/RoundLogo.png";

export interface SidebarNavItem {
  to: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  navLinks: SidebarNavItem[];
  bottomLinks?: SidebarNavItem[];
  userName?: string;
  userEmail?: string;
  userRole?: string;
  profileImage?: string;
  showToggleButton?: boolean;
  expandedWidthClass?: string;
  collapsedWidthClass?: string;
}

export default function Sidebar({
  isCollapsed,
  onToggle,
  navLinks,
  bottomLinks = [],
  userName = "Admin User",
  userEmail = "",
  userRole = "HR Manager",
  profileImage = roundLogo,
  showToggleButton = true,
  expandedWidthClass = "w-[240px]",
  collapsedWidthClass = "w-[64px]",
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) {
      return;
    }

    dispatch(logoutAdmin()).then(() => {
      navigate("/login");
    });
  };

  return (
    <nav
      className={`hidden md:flex fixed left-0 top-0 h-full shadow-sm flex-col py-5 z-50 transition-all duration-300 ${isCollapsed ? collapsedWidthClass : expandedWidthClass}`}
      style={{ backgroundColor: "rgb(30, 41, 59)" }}
    >
      <div
        className={`mb-5 flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}
      >
        {!isCollapsed && (
          <img src={logo} alt="Cerebulb Logo" className="h-9 w-auto object-contain" />
        )}
        {showToggleButton && (
          <button
            onClick={onToggle}
            className="text-on-primary/70 hover:text-on-primary transition-colors p-1 rounded hover:bg-on-primary/10"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? "menu" : "menu_open"}
            </span>
          </button>
        )}
      </div>

      <div
        className={`mb-5 flex items-center text-on-primary ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"}`}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-on-primary/20 bg-primary-container flex items-center justify-center shrink-0">
          <img
            src={profileImage}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        {!isCollapsed && (
          <div>
            <p className="text-label-md font-label-md text-on-primary font-bold">
              {userName}
            </p>
            {userRole && (
              <p className="text-label-sm font-label-sm text-on-primary/80">
                {userRole}
              </p>
            )}
            {userEmail && (
              <p className="text-label-sm font-label-sm text-on-primary/70 truncate">
                {userEmail}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navLinks.map((link) => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-2.5 px-4"} py-2 transition-colors duration-200 active:scale-95 text-label-md font-label-md border-l-4 ${active ? "text-on-primary bg-primary-container/20 border-primary-container" : "text-on-primary/60 hover:text-on-primary hover:bg-on-primary/10 border-transparent"}`}
              to={link.to}
              title={link.label}
            >
              <span
                className={`material-symbols-outlined ${active ? "fill text-primary-container" : ""}`}
              >
                {link.icon}
              </span>
              {!isCollapsed && (
                <span className={active ? "text-primary-container" : ""}>
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      {bottomLinks.length > 0 && (
        <div className="border-t border-white/10 pt-2 px-2">
          {bottomLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 transition-all duration-150 text-label-md font-label-md ${
                  active
                    ? "bg-white/10 border-primary-container text-white"
                    : "border-transparent text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                to={link.to}
                title={link.label}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {link.icon}
                </span>
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </div>
      )}

      <div className={`mt-auto ${isCollapsed ? "px-2" : "px-4"}`}>
        <button
          onClick={handleLogout}
          className={`w-full bg-primary-container text-on-primary-container text-label-md font-label-md py-2 px-3 rounded-lg hover:bg-primary-container/90 transition-colors shadow-sm flex items-center justify-center gap-2`}
          title="Log Out"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          {!isCollapsed && "Log Out"}
        </button>
      </div>
    </nav>
  );
}
