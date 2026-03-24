import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import {
  LayoutDashboard, Vote, BarChart3, History, Settings,
  LogOut, ChevronDown, Wallet, Shield, PlusCircle, List
} from "lucide-react";
import { useState } from "react";

function NavItem({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) =>
      `sidebar-link ${isActive ? "active" : ""}`
    }>
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { account, connectWallet, connecting } = useWallet();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Vote size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">VoteChain</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {isAdmin ? (
            <>
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin</p>
              <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" end />
              <NavItem to="/admin/elections/create" icon={PlusCircle} label="Create Election" />
              <NavItem to="/admin/elections/manage" icon={List} label="Manage Elections" />
              <NavItem to="/admin/add-admin" icon={Shield} label="Add Admin" />
              <div className="pt-3 mt-3 border-t border-slate-100">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Data</p>
                <NavItem to="/transactions" icon={History} label="Transactions" />
              </div>
            </>
          ) : (
            <>
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
              <NavItem to="/elections" icon={Vote} label="Elections" />
              <NavItem to="/transactions" icon={History} label="Transactions" />
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-slate-100 space-y-2">
          {/* Wallet button */}
          {account ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono font-medium text-emerald-700 truncate">{shortAddress}</span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-all"
            >
              <Wallet size={14} />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all"
            >
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-700">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-full text-xs font-medium">
                <Shield size={10} />
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Welcome back, <span className="font-medium text-slate-700">{user?.name}</span></span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
