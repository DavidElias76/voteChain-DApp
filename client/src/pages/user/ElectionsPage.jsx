import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Vote, Search, Calendar, Users } from "lucide-react";
import api from "../../services/api";

const StatusBadge = ({ status }) => (
  <span className={`badge-${status}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "pending" ? "bg-amber-500" : "bg-slate-400"}`} />
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/elections")
      .then(r => setElections(r.data.elections || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = elections.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Elections</h1>
        <p className="text-sm text-slate-500 mt-0.5">Browse and participate in elections</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search elections..."
            className="input pl-8 py-1.5"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {["all", "active", "pending", "ended"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Elections grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse"><div className="h-24 bg-slate-100 rounded" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <Vote size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No elections found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(el => (
            <div key={el.id} className="card p-5 hover:shadow-md transition-all duration-200 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Vote size={14} className="text-indigo-600" />
                </div>
                <StatusBadge status={el.status} />
              </div>

              <h3 className="font-semibold text-slate-900 text-sm mb-1">{el.title}</h3>
              {el.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{el.description}</p>}

              <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Users size={11} />{el.candidate_count} candidates</span>
                <span className="flex items-center gap-1"><Vote size={11} />{el.vote_count} votes</span>
              </div>

              <div className="flex gap-2 mt-3">
                {el.status === "active" && (
                  <Link to={`/elections/${el.id}/vote`} className="btn-primary flex-1 text-center">
                    Vote Now
                  </Link>
                )}
                <Link
                  to={`/elections/${el.id}/results`}
                  className={`${el.status === "active" ? "btn-secondary" : "btn-primary flex-1 text-center"}`}
                >
                  {el.status === "active" ? "Results" : "View Results"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
