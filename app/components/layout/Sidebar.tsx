import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/Store";
import { logoutAdmin } from "@/features/auth/AuthSlice";
import logo from "@/assets/Logo/Logo.png";
import roundLogo from "@/assets/Logo/RoundLogo.png";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`hidden md:flex fixed left-0 top-0 h-full shadow-sm flex-col py-5 z-50 transition-all duration-300 ${isCollapsed ? "w-[64px]" : "w-[240px]"}`}
      style={{ backgroundColor: "rgb(30, 41, 59)" }}
    >
      <div className={`mb-5 flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        {!isCollapsed && (
          <img
            src={logo}
            alt="Cerebulb Logo"
            className="h-9 w-auto object-contain"
          />
        )}
        <button
          onClick={onToggle}
          className="text-on-primary/70 hover:text-on-primary transition-colors p-1 rounded hover:bg-on-primary/10"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? "menu" : "menu_open"}
          </span>
        </button>
      </div>
      <div className={`mb-5 flex items-center text-on-primary ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"}`}>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-on-primary/20 bg-primary-container flex items-center justify-center shrink-0">
          <img
            src={roundLogo}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        {!isCollapsed && (
          <div>
            <p className="text-label-md font-label-md text-on-primary font-bold">
              Admin User
            </p>
            <p className="text-label-sm font-label-sm text-on-primary/80">
              HR Manager
            </p>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        <Link
          className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-2.5 px-4"} py-2 transition-colors duration-200 active:scale-95 text-label-md font-label-md border-l-4 ${isActive("/dashboard") ? "text-on-primary bg-primary-container/20 border-primary-container" : "text-on-primary/60 hover:text-on-primary hover:bg-on-primary/10 border-transparent"}`}
          to="/dashboard"
          title="Dashboard"
        >
          <span
            className={`material-symbols-outlined ${isActive("/dashboard") ? "fill text-primary-container" : ""}`}
          >
            dashboard
          </span>
          {!isCollapsed && (
            <span
              className={isActive("/dashboard") ? "text-primary-container" : ""}
            >
              Dashboard
            </span>
          )}
        </Link>
        <Link
          className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-2.5 px-4"} py-2 transition-colors duration-200 active:scale-95 text-label-md font-label-md border-l-4 ${isActive("/hr-administration") ? "text-on-primary bg-primary-container/20 border-primary-container" : "text-on-primary/60 hover:text-on-primary hover:bg-on-primary/10 border-transparent"}`}
          to="/hr-administration"
          title="HR Administration"
        >
          <span className="material-symbols-outlined">
            admin_panel_settings
          </span>
          {!isCollapsed && <span>HR Administration</span>}
        </Link>
        <Link
          className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-2.5 px-4"} py-2 transition-colors duration-200 active:scale-95 text-label-md font-label-md border-l-4 ${isActive("/employee-management") ? "text-on-primary bg-primary-container/20 border-primary-container" : "text-on-primary/60 hover:text-on-primary hover:bg-on-primary/10 border-transparent"}`}
          to="/employee-management"
          title="Employee Management"
        >
          <span
            className={`material-symbols-outlined ${isActive("/employee-management") ? "fill text-primary-container" : ""}`}
          >
            badge
          </span>
          {!isCollapsed && (
            <span
              className={
                isActive("/employee-management") ? "text-primary-container" : ""
              }
            >
              Employee Management
            </span>
          )}
        </Link>
        <Link
          className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-2.5 px-4"} py-2 transition-colors duration-200 active:scale-95 text-label-md font-label-md border-l-4 ${isActive("/leave") ? "text-on-primary bg-primary-container/20 border-primary-container" : "text-on-primary/60 hover:text-on-primary hover:bg-on-primary/10 border-transparent"}`}
          to="/leave"
          title="Leave"
        >
          <span className="material-symbols-outlined">event_busy</span>
          {!isCollapsed && <span>Leave</span>}
        </Link>
        <Link
          className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-2.5 px-4"} py-2 transition-colors duration-200 active:scale-95 text-label-md font-label-md border-l-4 ${isActive("/employee-problems") ? "text-on-primary bg-primary-container/20 border-primary-container" : "text-on-primary/60 hover:text-on-primary hover:bg-on-primary/10 border-transparent"}`}
          to="/employee-problems"
          title="Employee Problems"
        >
          <span className="material-symbols-outlined">report_problem</span>
          {!isCollapsed && <span>Employee Problems</span>}
        </Link>
      </div>
      <div className={`mt-auto ${isCollapsed ? "px-2" : "px-4"}`}>
        <button
          onClick={() => {
            const confirmed = window.confirm("Are you sure you want to log out?");

            if (!confirmed) {
              return;
            }

            dispatch(logoutAdmin()).then(() => {
              navigate("/login");
            });
          }}
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
