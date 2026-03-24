import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Trophy, Loader2, BarChart3 } from "lucide-react";
import api from "../../services/api";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ResultsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/results/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (!data) return <div className="card p-8 text-center text-slate-500">No results found</div>;

  const { election, candidates, total_votes } = data;
  const winner = candidates[0];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{election.title} — Results</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total_votes} total votes cast</p>
      </div>

      {/* Winner */}
      {election.status === "ended" && winner && Number(winner.vote_count) > 0 && (
        <div className="card p-5 border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-600">Winner</p>
              <p className="font-bold text-slate-900">{winner.name}</p>
              <p className="text-xs text-slate-500">{winner.vote_count} votes · {winner.percentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Bar chart */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Vote Distribution</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={candidates} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Bar dataKey="vote_count" radius={[4, 4, 0, 0]}>
              {candidates.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Candidates table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Detailed Results</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {candidates.map((c, i) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: COLORS[i % COLORS.length] + "20", color: COLORS[i % COLORS.length] }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <span className="text-xs font-semibold text-slate-700">{c.vote_count} votes</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${c.percentage}%`, background: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-500 w-10 text-right">{c.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
