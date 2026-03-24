import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AddAdminPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error("All fields are required");
    }
    setLoading(true);
    try {
      await api.post("/auth/add-admin", form);
      toast.success("Admin added successfully!");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Add Admin</h1>
        <p className="text-sm text-slate-500 mt-0.5">Create a new admin account</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6 p-3 bg-violet-50 border border-violet-200 rounded-lg">
          <Shield size={16} className="text-violet-600" />
          <p className="text-xs text-violet-700 font-medium">
            This account will have full admin access to create and manage elections.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Adding Admin...</>
                : <><Shield size={14} /> Add Admin</>
              }
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}