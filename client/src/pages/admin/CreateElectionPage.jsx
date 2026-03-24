import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PlusCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function CreateElectionPage() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setLoading(true);
    try {
      const { data } = await api.post("/elections", form);
      toast.success("Election created on blockchain!");
      navigate(`/admin/elections/${data.election.id}/candidates`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create election");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Create Election</h1>
        <p className="text-sm text-slate-500 mt-0.5">New election will be deployed to the Ethereum blockchain</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Election Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 2024 Student Council Election"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Provide context about this election..."
              className="input resize-none h-24"
            />
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <p className="text-xs font-medium text-indigo-800 mb-1">Blockchain deployment</p>
            <p className="text-xs text-indigo-600">This election will be created as a smart contract transaction on Ethereum. A MetaMask transaction may be required from the admin wallet.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><PlusCircle size={14} /> Create Election</>}
            </button>
            <button type="button" onClick={() => navigate("/admin")} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
