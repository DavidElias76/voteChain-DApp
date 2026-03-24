import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Vote, PlusCircle, Play, Square, BarChart3, Users, Hash, ArrowRight } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [elections, setElections] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = () => {
    Promise.all([
      api.get("/elections"),
      api.get("/blockchain/transactions")
    ]).then(([e, t]) => {
      setElections(e.data.elections || []);
      setTransactions(t.data.transactions || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStart = async (id) => {
    setActionLoading(id + "_start");
    try {
      await api.post(`/elections/start/${id}`);
      toast.success("Election started!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start election");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnd = async (id) => {
    if (!confirm("Are you sure you want to end this election?")) return;
    setActionLoading(id + "_end");
    try {
      await api.post(`/elections/end/${id}`);
      toast.success("Election ended!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to end election");
    } finally {
      setActionLoading(null);
    }
  };

  const active = elections.filter(e => e.status === "active").length;
  const pending = elections.filter(e => e.status === "pending").length;
  const totalVotes = elections.reduce((s, e) => s + Number(e.vote_count || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage elections and monitor results</p>
        </div>
        <Link to="/admin/elections/create" className="btn-primary flex items-center gap-2">
          <PlusCircle size={15} />
          New Election
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Vote, label: "Total Elections", value: elections.length, color: "bg-indigo-50 text-indigo-600" },
          { icon: Play, label: "Active", value: active, color: "bg-emerald-50 text-emerald-600" },
          { icon: Users, label: "Total Votes", value: totalVotes, color: "bg-violet-50 text-violet-600" },
          { icon: Hash, label: "Pending", value: pending, color: "bg-amber-50 text-amber-600" }
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={17} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Elections management table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">All Elections</h2>
          <Link to="/admin/elections/manage" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Manage all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Election</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidates</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Votes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : elections.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No elections yet</td></tr>
              ) : elections.map(el => (
                <tr key={el.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900 text-sm">{el.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">ID: {el.blockchain_election_id || "—"}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge-${el.status}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${el.status === "active" ? "bg-emerald-500" : el.status === "pending" ? "bg-amber-500" : "bg-slate-400"}`} />
                      {el.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{el.candidate_count}</td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{el.vote_count}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {el.status === "pending" && (
                        <>
                          <Link to={`/admin/elections/${el.id}/candidates`} className="btn-secondary py-1 px-2 text-xs">
                            + Candidates
                          </Link>
                          <button
                            onClick={() => handleStart(el.id)}
                            disabled={actionLoading === el.id + "_start" || !el.candidate_count}
                            className="btn-primary py-1 px-2 text-xs flex items-center gap-1"
                          >
                            <Play size={10} /> Start
                          </button>
                        </>
                      )}
                      {el.status === "active" && (
                        <button
                          onClick={() => handleEnd(el.id)}
                          disabled={actionLoading === el.id + "_end"}
                          className="btn-danger py-1 px-2 text-xs flex items-center gap-1"
                        >
                          <Square size={10} /> End
                        </button>
                      )}
                      <Link to={`/admin/elections/${el.id}/results`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <BarChart3 size={12} /> Results
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-indigo-600 flex items-center gap-1">View all <ArrowRight size={11} /></Link>
        </div>
        {transactions.slice(0, 5).map((tx, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash size={12} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-slate-600 truncate">{tx.transaction_hash}</p>
              <p className="text-xs text-slate-400 mt-0.5">{tx.voter_name} → {tx.candidate_name}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{new Date(tx.timestamp).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
