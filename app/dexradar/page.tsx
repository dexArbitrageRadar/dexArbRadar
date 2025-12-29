// app/dexradar/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import ArbCard from "../components/ArbCard";
import NetworkSelector from "../components/NetworkSelector";

// (Your existing PairConfig and Chain types)

type Chain =
  | "all"
  | "ethereum"
  | "arbitrum"
  | "optimism"
  | "polygon"
  | "bnb";

type PairConfig = {
  key: string;
  pairName: string;
  chain: string;
  rpc: string;
  token0: { symbol: string; address: string; decimals: number };
  token1: { symbol: string; address: string; decimals: number };
  paths: [PathConfig, PathConfig];
};

type PathConfig = {
  type: "v2" | "v3" | "cv3" | "pcv3";
  router: string;
  quoter?: string;
  fee?: number;
  label: string;
};

export default function DexRadar() {
  const [selectedChain, setSelectedChain] = useState<Chain>("all");
  const [pairs, setPairs] = useState<PairConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPairs() {
      const chainFiles = ["ethereum", "arbitrum", "optimism", "polygon", "bnb"] as const;

      const allPairs: PairConfig[] = [];

      for (const chain of chainFiles) {
        try {
          const res = await fetch(`/data/${chain}.json`, { cache: "no-store" });
          if (!res.ok) continue;
          const data: PairConfig[] = await res.json();
          allPairs.push(...data);
        } catch (err) {
          console.warn(`Exception loading ${chain}.json`, err);
        }
      }

      if (allPairs.length === 0) {
        setError("No JSON config files found in /public/data/");
      }

      setPairs(allPairs);
      setLoading(false);
    }

    loadPairs();
  }, []);

  const filtered = selectedChain === "all"
    ? pairs
    : pairs.filter((p) => p.chain.toLowerCase() === selectedChain);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#008080",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
        `,
        backgroundSize: "100px 100px",
        backgroundPosition: "center",
        fontSize: "15px",
        color: "#ffffff",
      }}
    >
      <Header showAboutButton={false} />

      <div style={{ flex: 1, padding: "24px 24px 24px" }}>
        {/* <h1
          style={{
            textAlign: "center",
            fontSize: "40px",
            fontWeight: "bold",
            marginBottom: "24px",
            color: "#ffffff",
          }}
        >
          DEX ARBITRAGE RADAR
        </h1> */}

        <NetworkSelector selectedChain={selectedChain} onSelect={setSelectedChain} />

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", fontSize: "20px" }}>
            Loading arbitrage scanners...
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "#c00000", fontSize: "18px" }}>{error}</p>
            <p style={{ fontSize: "14px", marginTop: "16px", opacity: 0.7 }}>
              Make sure files are in:{" "}
              <code style={{ background: "#000080", padding: "4px 12px", borderRadius: "4px" }}>
                public/data/ethereum.json
              </code>
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", fontSize: "24px", color: "#c0c0c0" }}>
            No pairs configured for <span style={{ color: "#ffffff" }}>{selectedChain}</span> yet
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            {filtered.map((config) => (
              <ArbCard key={config.key} config={config} />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        style={{
          background: "#000080",
          color: "white",
          padding: "14px 0",
          textAlign: "center",
          fontSize: "11px",
          borderTop: "2px solid #ffffff",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div>© 2025 - DEX Arbitrage Radar</div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="https://x.com/DexArbRadar"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "6px", color: "white", textDecoration: "none" }}
            >
              <img src="/logo/x-logo.png?v=034" alt="X" width="20" height="20" />
              @DexArbRadar
            </a>
            <a
              href="https://www.reddit.com/user/dex-arbitrage-radar/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "6px", color: "white", textDecoration: "none" }}
            >
              <img
                src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png"
                alt="Reddit"
                width="20"
                height="20"
              />
              u/dex-arbitrage-radar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}