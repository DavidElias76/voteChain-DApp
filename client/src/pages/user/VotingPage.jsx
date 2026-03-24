import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Vote, Wallet, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { ethers } from "ethers";
import api from "../../services/api";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import VotingABI from "../../contracts/Voting.json";

export default function VotingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, signer, connectWallet } = useWallet();
  const { user } = useAuth();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/elections/${id}`),
      api.get(`/candidates/${id}`),
      api.get(`/vote/status/${id}`),
      api.get("/blockchain/contract")
    ]).then(([e, c, vs, ci]) => {
      setElection(e.data.election);
      setCandidates(c.data.candidates);
      setHasVoted(vs.data.has_voted);
      setContractAddress(ci.data.address);
      if (vs.data.has_voted && vs.data.vote) {
        setTxHash(vs.data.vote.transaction_hash);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!selected) return toast.error("Please select a candidate");
    if (!account) return toast.error("Please connect your wallet first");
    if (!signer) return toast.error("Wallet signer not available");
    if (!contractAddress) return toast.error("Smart contract not deployed");

    setVoting(true);
    try {
      const abi = VotingABI.abi;
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const candidate = candidates.find(c => c.id === selected);
      if (!candidate?.blockchain_candidate_id) throw new Error("Candidate blockchain ID not found");
      if (!election?.blockchain_election_id) throw new Error("Election blockchain ID not found");

      toast.loading("Sending transaction to blockchain...", { id: "vote" });
      const tx = await contract.vote(
        election.blockchain_election_id,
        candidate.blockchain_candidate_id
      );

      toast.loading("Waiting for confirmation...", { id: "vote" });
      const receipt = await tx.wait();

      await api.post("/vote", {
        election_id: id,
        candidate_id: selected,
        transaction_hash: receipt.hash
      });

      toast.success("Vote cast successfully!", { id: "vote" });
      setTxHash(receipt.hash);
      setHasVoted(true);
    } catch (err) {
      console.error(err);
      toast.error(err.reason || err.message || "Voting failed", { id: "vote" });
    } finally {
      setVoting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 size={24} className="animate-spin text-indigo-600" />
    </div>
  );

  if (!election) return <div className="card p-8 text-center text-slate-500">Election not found</div>;

  if (election.status !== "active") return (
    <div className="card p-8 text-center">
      <AlertTriangle size={32} className="mx-auto text-amber-400 mb-3" />
      <p className="font-medium text-slate-900">Election is not active</p>
      <p className="text-sm text-slate-500 mt-1">This election is {election.status}</p>
    </div>
  );

  if (hasVoted) return (
    <div className="max-w-lg mx-auto space-y-4 animate-fade-in">
      <div className="card p-8 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Vote Recorded!</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Your vote has been securely recorded on the Ethereum blockchain.</p>
        {txHash && (
          <div className="bg-slate-50 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
            <p className="font-mono text-xs text-slate-700 break-all">{txHash}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => navigate(`/elections/${id}/results`)} className="btn-primary flex-1">
            View Results
          </button>
          <button onClick={() => navigate("/elections")} className="btn-secondary flex-1">
            All Elections
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{election.title}</h1>
        {election.description && <p className="text-sm text-slate-500 mt-1">{election.description}</p>}
      </div>

      {!account ? (
        <div className="card p-5 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <Wallet size={20} className="text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Wallet required to vote</p>
              <p className="text-xs text-amber-600">Connect MetaMask to participate</p>
            </div>
            <button onClick={connectWallet} className="btn-primary text-xs py-1.5">Connect</button>
          </div>
        </div>
      ) : (
        <div className="card p-3 border-emerald-200 bg-emerald-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs font-mono text-emerald-700">{account}</span>
        </div>
      )}

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Select a Candidate</h2>
          <p className="text-xs text-slate-500 mt-0.5">Click to select, then confirm your vote</p>
        </div>
        <div className="p-4 space-y-3">
          {candidates.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              disabled={voting}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                selected === c.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  selected === c.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                  {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  selected === c.id ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                }`}>
                  {selected === c.id && <div className="w-full h-full rounded-full bg-white scale-[0.4]" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleVote}
            disabled={!selected || voting || !account}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            {voting ? (
              <><Loader2 size={15} className="animate-spin" /> Processing on blockchain...</>
            ) : (
              <><Vote size={15} /> Cast Vote</>
            )}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            Your vote is permanent and cannot be changed once submitted
          </p>
        </div>
      </div>
    </div>
  );
}