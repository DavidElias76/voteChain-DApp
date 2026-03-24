import { useEffect, useState } from "react";
import { Hash, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import api from "../../services/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blockchain/transactions")
      .then(r => setTransactions(r.data.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Blockchain Transactions</h1>
        <p className="text-sm text-slate-500 mt-0.5">All vote transactions recorded on the Ethereum blockchain</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
          <span className="text-xs text-slate-500">{transactions.length} total</span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center">
            <Hash size={28} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">TX Hash</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Voter</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Election</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Block</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-600">
                          {tx.transaction_hash?.slice(0, 8)}...{tx.transaction_hash?.slice(-6)}
                        </span>
                        <a
                          href={`https://etherscan.io/tx/${tx.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-xs font-medium text-slate-900">{tx.voter_name}</p>
                        {tx.wallet_address && (
                          <p className="font-mono text-xs text-slate-400">{tx.wallet_address.slice(0, 8)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 max-w-[150px] truncate">{tx.election_title}</td>
                    <td className="px-5 py-3 text-xs font-medium text-slate-800">{tx.candidate_name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{tx.block_number || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                        <CheckCircle size={10} /> Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
