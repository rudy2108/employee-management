import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/Store";
import { logoutAdmin } from "@/features/auth/AuthSlice";
import logo from "@/assets/Logo/Logo.png";

// ─── Nav Links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: "/employee-dashboard", icon: "dashboard", label: "My Dashboard" },
  { to: "/employee-profile", icon: "person", label: "My Profile" },
  { to: "/employee-leave", icon: "calendar_today", label: "My Leave" },
  { to: "/employee-support", icon: "report_problem", label: "Support" },
];

const BOTTOM_LINKS = [
  { to: "/employee-settings", icon: "settings", label: "Settings" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const admin = useSelector((s: RootState) => s.auth.admin);

  const [clockedIn, setClockedIn] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    dispatch(logoutAdmin()).then(() => {
      navigate("/login");
    });
  };

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full w-[280px] flex-col py-6 shadow-lg z-50"
      style={{ backgroundColor: "rgb(30, 41, 59)", color: "white" }}
    >
      {/* ── Brand / Logo ───────────────────────────────────── */}
      <div className="px-4 mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-[22px]">
              hub
            </span>
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md font-bold text-white leading-tight">
              Employee Portal
            </h1>
            <p className="text-label-md font-label-md text-white/60">
              Cerebulb Tech
            </p>
          </div>
        </div>
      </div>

      {/* ── User Badge ─────────────────────────────────────── */}
      <div className="mx-4 mb-5 p-3 rounded-xl bg-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-container/30 border-2 border-primary-container/50 flex items-center justify-center shrink-0 overflow-hidden">
          <span className="material-symbols-outlined text-primary-container text-[22px]">
            account_circle
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-label-md font-label-md text-white font-bold truncate">
            {admin?.name ?? "Employee"}
          </p>
          <p className="text-label-sm font-label-sm text-white/60 truncate">
            {admin?.email ?? ""}
          </p>
        </div>
      </div>

      {/* ── Main Nav ───────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              title={link.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 transition-all duration-150 active:scale-[0.98] text-label-md font-label-md ${
                active
                  ? "bg-white/10 border-primary-container text-white"
                  : "border-transparent text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-all ${
                  active ? "text-primary-container" : ""
                }`}
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                    : undefined
                }
              >
                {link.icon}
              </span>
              <span className={active ? "font-bold" : ""}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Clock In / Out Button ──────────────────────────── */}
      <div className="px-4 mt-4 mb-5">
        <button
          id="emp-sidebar-clock-btn"
          onClick={() => setClockedIn((v) => !v)}
          className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 duration-150 transition-all text-label-md font-label-md shadow-md ${
            clockedIn
              ? "bg-error-container text-on-error-container"
              : "bg-primary-container text-on-primary-container"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {clockedIn ? "logout" : "schedule"}
          </span>
          {clockedIn ? "Clock Out" : "Clock In"}
        </button>
      </div>

      {/* ── Bottom Section ─────────────────────────────────── */}
      <div className="border-t border-white/10 pt-2 px-2">
        {BOTTOM_LINKS.map((link) => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              title={link.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 transition-all duration-150 text-label-md font-label-md ${
                active
                  ? "bg-white/10 border-primary-container text-white"
                  : "border-transparent text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 border-transparent text-white/70 hover:bg-white/10 hover:text-white transition-all duration-150 text-label-md font-label-md"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
