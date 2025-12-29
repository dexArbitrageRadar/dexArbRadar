// components/NetworkSelector.tsx
"use client";

import React from "react";


const CHAINS = [
  { id: "all", icon: "Globe" },
  { id: "ethereum", icon: "Ethereum" },
  { id: "arbitrum", icon: "Arbitrum" },
  { id: "optimism", icon: "Optimism" },
  { id: "polygon", icon: "Polygon" },
  { id: "bnb", icon: "BNB" },
] as const;

type ChainId = (typeof CHAINS)[number]["id"];

type Props = {
  selectedChain: ChainId;
  onSelect: (id: ChainId) => void;
};


export default function NetworkSelector({ selectedChain, onSelect }: Props) {
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "8px",
      marginBottom: "40px",
      padding: "8px",
      background: "#c0c0c0",
      borderTop: "2px solid #000000",
      borderLeft: "2px solid #000000",
      borderRight: "2px solid #ffffff",
      borderBottom: "2px solid #ffffff",
      borderRadius: "4px",
    }}>
      {CHAINS.map((chain) => (
        <button
          key={chain.id}
          onClick={() => onSelect(chain.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            background: selectedChain === chain.id ? "#000080" : "#c0c0c0",
            color: selectedChain === chain.id ? "#ffffff" : "#000000",
            borderTop: selectedChain === chain.id ? "2px solid #ffffff" : "2px solid #000000",
            borderLeft: selectedChain === chain.id ? "2px solid #ffffff" : "2px solid #000000",
            borderRight: selectedChain === chain.id ? "2px solid #000000" : "2px solid #ffffff",
            borderBottom: selectedChain === chain.id ? "2px solid #000000" : "2px solid #ffffff",
            cursor: "pointer",
          }}
        >
          <ChainIcon name={chain.icon} active={selectedChain === chain.id} />
        </button>
      ))}
    </div>
  );
}

function ChainIcon({ name, active }: { name: string; active: boolean }) {
    const icons: Record<string, string> = {
    Globe: "🌐",
    Ethereum: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=034",
    Arbitrum: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=034",
    Optimism: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=034",
    Polygon: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=034",
    BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=034",
  };

  const src = icons[name] || icons.Globe;

  if (src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={name}
        width={20}
        height={20}
        style={{ objectFit: "contain", opacity: active ? 1 : 0.5 }}
      />
    );
  }
  return <span style={{ fontSize: "18px", opacity: active ? 1 : 0.5 }}>{src}</span>;
}