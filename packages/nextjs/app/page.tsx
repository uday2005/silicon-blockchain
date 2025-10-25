"use client";

import React from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// --- Proof and Verification Component ---
const ProofSection = ({
  orgId,
  expense,
  expenseId,
  orgData,
}: {
  orgId: bigint;
  expense: any;
  expenseId: bigint;
  orgData: any;
}) => {
  const { address: connectedAddress } = useAccount();
  const [proofHash, setProofHash] = React.useState("");

  const { data: vendorData } = useScaffoldReadContract({
    contractName: "FundManager",
    functionName: "vendors",
    args: [expense.vendor],
  });
  const { data: proofScore, refetch: refetchProofScore } = useScaffoldReadContract({
    contractName: "FundManager",
    functionName: "proofTrustScores",
    args: [orgId, expenseId],
  });

  const { writeContractAsync: submitProofAsync, isPending: isSubmittingProof } =
    useScaffoldWriteContract("FundManager");
  const { writeContractAsync: verifyProofAsync, isPending: isVerifyingProof } = useScaffoldWriteContract("FundManager");

  const handleSubmitProof = async () => {
    try {
      await submitProofAsync({ functionName: "submitProof", args: [orgId, expenseId, proofHash] });
      setProofHash("");
    } catch (e) {
      console.error("Error submitting proof:", e);
    }
  };

  const handleVerifyProof = async (upvote: boolean) => {
    try {
      await verifyProofAsync({ functionName: "verifyProof", args: [orgId, expenseId, upvote] });
      refetchProofScore();
    } catch (e) {
      console.error("Error verifying proof:", e);
    }
  };

  const canSubmitProof = connectedAddress === expense.vendor || connectedAddress === orgData?.[3];

  return (
    <div className="mt-4 border-t border-gray-700 pt-3">
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <p className="font-bold text-white">Vendor Details</p>
          <Address address={expense.vendor} />
          {/* FIX: Use indexed access for vendorData */}
          {vendorData?.[4] && <p className="text-green-400">Reputation: {vendorData[3].toString()}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold text-white">Proof Trust Score</p>
          <p className="text-2xl font-bold text-amber-400">{proofScore?.toString() ?? "0"}</p>
        </div>
      </div>
      <div className="mt-3">
        {canSubmitProof && (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Submit new IPFS Proof CID"
              className="input input-sm input-bordered w-full bg-[#1A1A1A]"
              value={proofHash}
              onChange={e => setProofHash(e.target.value)}
            />
            <button className="btn btn-sm btn-secondary" onClick={handleSubmitProof} disabled={isSubmittingProof}>
              {isSubmittingProof ? "..." : "Submit"}
            </button>
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            className="btn btn-sm bg-green-500"
            onClick={() => handleVerifyProof(true)}
            disabled={isVerifyingProof}
          >
            Upvote
          </button>
          <button
            className="btn btn-sm bg-red-500"
            onClick={() => handleVerifyProof(false)}
            disabled={isVerifyingProof}
          >
            Downvote
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Expense Management Component ---
const ExpenseSection = ({ orgId, orgHead, orgData }: { orgId: bigint; orgHead?: string; orgData: any }) => {
  const { address: connectedAddress } = useAccount();
  const [description, setDescription] = React.useState("");
  const [vendor, setVendor] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [proofHash, setProofHash] = React.useState("");
  const { data: expenses, refetch: refetchExpenses } = useScaffoldReadContract({
    contractName: "FundManager",
    functionName: "getExpenses",
    args: [orgId],
  });
  const { writeContractAsync: createExpenseAsync, isPending: isCreatePending } =
    useScaffoldWriteContract("FundManager");

  const handleCreateExpense = async () => {
    try {
      await createExpenseAsync({
        functionName: "createExpense",
        args: [orgId, description, vendor, parseEther(amount), proofHash],
      });
      setDescription("");
      setVendor("");
      setAmount("");
      setProofHash("");
      refetchExpenses();
    } catch (e) {
      console.error("Error creating expense:", e);
    }
  };

  return (
    <div className="mt-6">
      {connectedAddress === orgHead && (
        <div className="bg-black bg-opacity-25 p-4 rounded-lg mb-6">
          <h4 className="font-bold text-lg mb-2 text-white">Create New Expense</h4>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Description"
              className="input input-bordered w-full bg-[#1A1A1A]"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <AddressInput placeholder="Vendor Address" value={vendor} onChange={setVendor} />
            <input
              type="number"
              placeholder="Amount (ETH)"
              className="input input-bordered w-full bg-[#1A1A1A]"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <input
              type="text"
              placeholder="Initial Proof Hash (IPFS CID)"
              className="input input-bordered w-full bg-[#1A1A1A]"
              value={proofHash}
              onChange={e => setProofHash(e.target.value)}
            />
            <button
              className="btn bg-blue-400 hover:bg-blue-500 text-black font-bold"
              onClick={handleCreateExpense}
              disabled={isCreatePending}
            >
              {isCreatePending ? "..." : "Submit Expense"}
            </button>
          </div>
        </div>
      )}
      <h4 className="font-bold text-lg mb-2 text-white">Expenses</h4>
      <div className="flex flex-col gap-3">
        {expenses && expenses.length > 0 ? (
          expenses.map((expense, index) => (
            <div key={index} className="bg-black bg-opacity-25 p-4 rounded-lg text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white text-base">{expense.description}</p>
                  <p className="text-gray-400">
                    Proof Hash: <span className="break-all">{expense.proofHash || "N/A"}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-white">{formatEther(expense.amount)} ETH</p>
                  {expense.status === 0 ? (
                    <span className="badge badge-warning text-black">Pending</span>
                  ) : (
                    <span className="badge badge-success text-black">Approved</span>
                  )}
                </div>
              </div>
              {/* FIX: Pass orgData down to the ProofSection component */}
              <ProofSection orgId={orgId} expense={expense} expenseId={BigInt(index)} orgData={orgData} />
            </div>
          ))
        ) : (
          <p className="text-gray-500">No expenses for this organization.</p>
        )}
      </div>
    </div>
  );
};

// --- Organization Card Component ---
const OrganizationCard = ({ orgId }: { orgId: bigint }) => {
  const [donationAmount, setDonationAmount] = React.useState("");
  const { data: orgData } = useScaffoldReadContract({
    contractName: "FundManager",
    functionName: "organizations",
    args: [orgId],
  });
  const { writeContractAsync: donateAsync, isPending: isDonationPending } = useScaffoldWriteContract("FundManager");

  const handleDonate = async () => {
    try {
      await donateAsync({ functionName: "donate", args: [orgId], value: parseEther(donationAmount) });
      setDonationAmount("");
    } catch (e) {
      console.error("Error during donation:", e);
    }
  };

  if (!orgData || !orgData[4]) return null;
  const [, , , head] = orgData;

  return (
    <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg border border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white">{orgData[0]}</h3>
          <p className="text-gray-400">{orgData[1]}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-gray-400 text-xs">Total Raised</p>
          <p className="text-2xl font-bold text-[#00BFFF]">{formatEther(orgData[2])} ETH</p>
        </div>
      </div>
      <div className="text-sm mt-2">
        <span className="font-semibold text-gray-300">Managed by: </span>
        <Address address={head} />
      </div>
      <div className="flex items-center gap-2 mt-4">
        <input
          type="number"
          placeholder="0.1 ETH"
          className="input input-bordered w-full bg-[#1A1A1A]"
          value={donationAmount}
          onChange={e => setDonationAmount(e.target.value)}
        />
        <button
          className="btn bg-[#00BFFF] hover:bg-blue-500 text-black font-bold"
          onClick={handleDonate}
          disabled={isDonationPending || !donationAmount}
        >
          {isDonationPending ? "..." : "Donate"}
        </button>
      </div>
      <hr className="border-gray-600 my-4" />
      {/* FIX: Pass orgData down to the ExpenseSection component */}
      <ExpenseSection orgId={orgId} orgHead={head} orgData={orgData} />
    </div>
  );
};

// --- Main Home Page ---
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [orgName, setOrgName] = React.useState("");
  const [orgDetails, setOrgDetails] = React.useState("");
  const { data: contractOwner } = useScaffoldReadContract({ contractName: "FundManager", functionName: "owner" });
  const { data: orgCount, refetch: refetchOrgCount } = useScaffoldReadContract({
    contractName: "FundManager",
    functionName: "orgCount",
  });
  const { writeContractAsync: createOrgAsync, isPending: isCreatePending } = useScaffoldWriteContract("FundManager");

  const isContractOwner = connectedAddress === contractOwner;

  const handleCreateOrganization = async () => {
    try {
      await createOrgAsync({ functionName: "createOrganization", args: [orgName, orgDetails] });
      setOrgName("");
      setOrgDetails("");
      setTimeout(() => refetchOrgCount(), 1000);
    } catch (e) {
      console.error("Error creating organization:", e);
    }
  };

  const orgIds = orgCount ? Array.from({ length: Number(orgCount) }, (_, i) => BigInt(i + 1)) : [];

  return (
    <div className="flex flex-col items-center grow pt-10 bg-[#1A1A1A] text-white min-h-screen">
      <div className="px-5 w-full max-w-6xl">
        <h1 className="text-center mb-4">
          <span className="block text-4xl font-bold">FundChain</span>
          <span className="block text-xl mt-2 font-light text-gray-400">Transparent Fund Tracking on Blockchain</span>
        </h1>
        <div className="flex justify-center items-center space-x-2 my-4">
          <p className="font-medium text-gray-300">Connected As:</p>
          <Address address={connectedAddress} />
          {isContractOwner && <span className="badge badge-success text-black font-bold">Admin</span>}
        </div>
      </div>
      <div className="w-full max-w-6xl px-5 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg border border-gray-700 sticky top-10">
            <h3 className="text-2xl font-bold mb-4">Start a New Fundraiser</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Organization Name"
                className="input input-bordered w-full bg-[#1A1A1A]"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
              />
              <textarea
                placeholder="Describe your mission..."
                className="textarea textarea-bordered w-full bg-[#1A1A1A]"
                value={orgDetails}
                onChange={e => setOrgDetails(e.target.value)}
              />
              <button
                className="btn bg-[#00BFFF] hover:bg-blue-500 text-black font-bold"
                onClick={handleCreateOrganization}
                disabled={isCreatePending}
              >
                {isCreatePending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold mb-4">Live Organizations</h2>
          <div className="flex flex-col gap-6">
            {orgIds.length === 0 ? (
              <p className="text-gray-500">No organizations yet.</p>
            ) : (
              orgIds.map(id => <OrganizationCard key={id.toString()} orgId={id} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
