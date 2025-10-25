"use client";

import React, { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const VendorsPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // State for Vendor Registration
  const [vendorName, setVendorName] = useState("");
  const [vendorDetails, setVendorDetails] = useState("");

  // State for Vendor Lookup
  const [lookupAddress, setLookupAddress] = useState("");
  const [vendorToDisplay, setVendorToDisplay] = useState("");

  const { writeContractAsync: registerVendorAsync, isPending: isRegisterPending } =
    useScaffoldWriteContract("FundManager");

  const { data: lookedUpVendor } = useScaffoldReadContract({
    contractName: "FundManager",
    functionName: "vendors",
    args: [vendorToDisplay],
  });

  const handleRegister = async () => {
    try {
      await registerVendorAsync({
        functionName: "registerVendor",
        args: [vendorName, vendorDetails],
      });
      setVendorName("");
      setVendorDetails("");
    } catch (e) {
      console.error("Error registering vendor:", e);
    }
  };

  return (
    <div className="flex flex-col items-center grow pt-10 bg-[#1A1A1A] text-white min-h-screen">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center mb-4">
          <span className="block text-4xl font-bold">Vendor Hub</span>
          <span className="block text-xl mt-2 font-light text-gray-400">
            Register as a Vendor or Look Up Reputation
          </span>
        </h1>
      </div>

      <div className="w-full max-w-4xl px-5 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Register as a Vendor */}
        <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-2xl font-bold mb-4">Become a Verified Vendor</h3>
          <p className="text-gray-400 mb-4">
            Your connected address will be used for registration:
            <Address address={connectedAddress} />
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name or Company Name"
              className="input input-bordered w-full bg-[#1A1A1A] border-gray-600"
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
            />
            <textarea
              placeholder="What services do you provide?"
              className="textarea textarea-bordered w-full bg-[#1A1A1A] border-gray-600"
              value={vendorDetails}
              onChange={e => setVendorDetails(e.target.value)}
            />
            <button
              className="btn bg-[#00BFFF] hover:bg-blue-500 text-black font-bold"
              onClick={handleRegister}
              disabled={isRegisterPending}
            >
              {isRegisterPending ? "Registering..." : "Register"}
            </button>
          </div>
        </div>

        {/* Right Side: Look up a vendor */}
        <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-2xl font-bold mb-4">Check Vendor Reputation</h3>
          <div className="flex flex-col gap-4">
            <AddressInput placeholder="Enter vendor address" value={lookupAddress} onChange={setLookupAddress} />
            <button className="btn btn-primary" onClick={() => setVendorToDisplay(lookupAddress)}>
              Look Up Vendor
            </button>

            {vendorToDisplay && lookedUpVendor && (
              <div className="mt-4 border-t border-gray-600 pt-4">
                {/* The 'exists' property is at index 4 */}
                {lookedUpVendor[4] ? (
                  <div>
                    {/* name is index 0, details is index 1 */}
                    <h4 className="text-xl font-bold">{lookedUpVendor[0]}</h4>
                    <p className="text-gray-400">{lookedUpVendor[1]}</p>
                    <div className="mt-2 text-2xl">
                      Reputation Score: {/* reputation is index 3 */}
                      <span className="font-bold text-green-400">{lookedUpVendor[3].toString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-400">No vendor registered with this address.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
