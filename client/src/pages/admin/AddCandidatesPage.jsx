import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PlusCircle, Loader2, Users, Trash2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AddCandidatesPage() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchData = () =>
    Promise.all([
      api.get(`/elections/${id}`),
      api.get(`/candidates/${id}`)
    ]).then(([e, c]) => {
      setElection(e.data.election);
      setCandidates(c.data.candidates);
    }).finally(() => setLoading(false));

  useEffect(() => { fetchData(); }, [id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Candidate name required");
    setAdding(true);
    try {
      await api.post("/candidates", { election_id: id, ...form });
      toast.success("Candidate added to blockchain!");
      setForm({ name: "", description: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add candidate");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add Candidates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{election?.title}</p>
        </div>
        <Link to="/admin" className="btn-secondary text-xs">← Back</Link>
      </div>

      {/* Add form */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">New Candidate</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Candidate name"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Bio / Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description or platform..."
              className="input resize-none h-20"
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary flex items-center gap-2">
            {adding ? <><Loader2 size={14} className="animate-spin" /> Adding to blockchain...</> : <><PlusCircle size={14} /> Add Candidate</>}
          </button>
        </form>
      </div>

      {/* Candidates list */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Candidates ({candidates.length})</h2>
          <Users size={15} className="text-slate-400" />
        </div>
        {candidates.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No candidates added yet</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {candidates.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
                </div>
                {c.blockchain_candidate_id && (
                  <span className="text-xs font-mono text-slate-400">Chain #{c.blockchain_candidate_id}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
