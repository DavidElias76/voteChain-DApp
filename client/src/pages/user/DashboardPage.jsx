import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Vote, Users, BarChart3, Hash, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

function StatCard({ icon: Icon, label, value, sub, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600"
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() {
  const { user } = useAuth();
  const { account, connectWallet } = useWallet();
  const [elections, setElections] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/elections"),
      api.get("/blockchain/transactions")
    ]).then(([e, t]) => {
      setElections(e.data.elections || []);
      setTransactions(t.data.transactions || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const activeElections = elections.filter(e => e.status === "active");
  const pendingElections = elections.filter(e => e.status === "pending");
  const endedElections = elections.filter(e => e.status === "ended");
  const totalVotes = elections.reduce((s, e) => s + Number(e.vote_count || 0), 0);

  // Chart data: vote distribution
  const voteChartData = elections.slice(0, 5).map(e => ({
    name: e.title.length > 15 ? e.title.slice(0, 15) + "…" : e.title,
    votes: Number(e.vote_count || 0)
  }));

  // Status pie chart
  const statusData = [
    { name: "Active", value: activeElections.length },
    { name: "Pending", value: pendingElections.length },
    { name: "Ended", value: endedElections.length }
  ].filter(d => d.value > 0);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-5 animate-pulse"><div className="h-16 bg-slate-100 rounded" /></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your voting activity</p>
        </div>
        {!account && (
          <button onClick={connectWallet} className="btn-primary flex items-center gap-2">
            Connect Wallet
          </button>
        )}
      </div>

      {/* Wallet warning */}
      {!account && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Wallet not connected</p>
            <p className="text-xs text-amber-600 mt-0.5">Connect your MetaMask wallet to participate in elections and cast votes on the blockchain.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Vote} label="Active Elections" value={activeElections.length} sub="Currently live" color="indigo" />
        <StatCard icon={Users} label="Total Votes Cast" value={totalVotes} sub="Across all elections" color="emerald" />
        <StatCard icon={Clock} label="Pending" value={pendingElections.length} sub="Not yet started" color="amber" />
        <StatCard icon={Hash} label="Transactions" value={transactions.length} sub="Blockchain records" color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Votes by Election</h2>
            <TrendingUp size={15} className="text-slate-400" />
          </div>
          {voteChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={voteChartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="votes" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No election data yet</div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Election Status</h2>
            <BarChart3 size={15} className="text-slate-400" />
          </div>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No elections</div>
          )}
        </div>
      </div>

      {/* Recent elections */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent Elections</h2>
          <Link to="/elections" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {elections.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No elections yet</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {elections.slice(0, 5).map(el => (
              <div key={el.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{el.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{el.candidate_count} candidates · {el.vote_count} votes</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`badge-${el.status}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${el.status === "active" ? "bg-emerald-500" : el.status === "pending" ? "bg-amber-500" : "bg-slate-400"}`} />
                    {el.status}
                  </span>
                  {el.status === "active" && (
                    <Link to={`/elections/${el.id}/vote`} className="btn-primary py-1 px-3 text-xs">Vote</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
