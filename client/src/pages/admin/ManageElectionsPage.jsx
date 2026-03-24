import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Square, Users, BarChart3, PlusCircle, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function ManageElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchElections = () =>
    api.get("/elections").then(r => setElections(r.data.elections || [])).finally(() => setLoading(false));

  useEffect(() => { fetchElections(); }, []);

  const handleAction = async (id, action) => {
    if (action === "end" && !confirm("End this election? This cannot be undone.")) return;
    setActionLoading(`${id}_${action}`);
    try {
      await api.post(`/elections/${action}/${id}`);
      toast.success(`Election ${action === "start" ? "started" : "ended"} successfully`);
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} election`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manage Elections</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control election lifecycle</p>
        </div>
        <Link to="/admin/elections/create" className="btn-primary flex items-center gap-2">
          <PlusCircle size={14} /> New Election
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : elections.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-slate-500 text-sm">No elections yet. Create one to get started.</p>
          </div>
        ) : elections.map(el => (
          <div key={el.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm">{el.title}</h3>
                  <span className={`badge-${el.status}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${el.status === "active" ? "bg-emerald-500" : el.status === "pending" ? "bg-amber-500" : "bg-slate-400"}`} />
                    {el.status}
                  </span>
                </div>
                {el.description && <p className="text-xs text-slate-500 mb-2">{el.description}</p>}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Users size={11} />{el.candidate_count} candidates</span>
                  <span>{el.vote_count} votes</span>
                  {el.blockchain_election_id && <span className="font-mono">Chain ID: {el.blockchain_election_id}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {el.status === "pending" && (
                  <>
                    <Link to={`/admin/elections/${el.id}/candidates`} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                      <Users size={11} /> Candidates
                    </Link>
                    <button
                      onClick={() => handleAction(el.id, "start")}
                      disabled={actionLoading === `${el.id}_start` || !el.candidate_count}
                      className="btn-primary py-1 px-2 text-xs flex items-center gap-1"
                      title={!el.candidate_count ? "Add candidates first" : ""}
                    >
                      {actionLoading === `${el.id}_start` ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                      Start
                    </button>
                  </>
                )}
                {el.status === "active" && (
                  <button
                    onClick={() => handleAction(el.id, "end")}
                    disabled={actionLoading === `${el.id}_end`}
                    className="btn-danger py-1 px-2 text-xs flex items-center gap-1"
                  >
                    {actionLoading === `${el.id}_end` ? <Loader2 size={11} className="animate-spin" /> : <Square size={11} />}
                    End Election
                  </button>
                )}
                <Link to={`/admin/elections/${el.id}/results`} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                  <BarChart3 size={11} /> Results
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
