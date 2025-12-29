// components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type PriceData = {
  usd: number;
  usd_24h_change: number;
};

const STATUS_TOKENS = [
  { id: "bitcoin", symbol: "BTC", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=034" },
  { id: "ethereum", symbol: "ETH", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034" },
  { id: "binancecoin", symbol: "BNB", logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=034" },
  { id: "solana", symbol: "SOL", logo: "https://cryptologos.cc/logos/solana-sol-logo.png?v=034" },
  { id: "arbitrum", symbol: "ARB", logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=034" },
  { id: "optimism", symbol: "OP", logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=034" },
  { id: "matic-network", symbol: "MATIC", logo: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=034" },
  { id: "uniswap", symbol: "UNI", logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=034" },
  { id: "chainlink", symbol: "LINK", logo: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=034" },
  { id: "dai", symbol: "DAI", logo: "https://cryptologos.cc/logos/dai-dai-logo.png?v=034" },
  { id: "pancakeswap-token", symbol: "CAKE", logo: "https://cryptologos.cc/logos/pancakeswap-cake-logo.png?v=034" },
  { id: "gmx", symbol: "GMX", logo: "/logo/gmx-logo.png?v=034" },
];

type Props = {
  showAboutButton?: boolean;
  onAboutClick?: () => void;
};

export default function Header({ showAboutButton = true, onAboutClick }: Props) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

//   useEffect(() => {
//     async function fetchPrices() {
//       try {
//         const ids = STATUS_TOKENS.map((t) => t.id).join(",");
//         const res = await fetch(
//           `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
//         );
//         if (!res.ok) return;
//         const json = await res.json();
//         setPrices(json);
//       } catch (e) {
//         console.error("CoinGecko fetch failed", e);
//       }
//     }

//     fetchPrices();
//     const interval = setInterval(fetchPrices, 60_000);
//     return () => clearInterval(interval);
//   }, []);


// Inside the useEffect in Header.tsx – replace the fetchPrices function

useEffect(() => {
  async function fetchPrices() {
    try {
      const ids = STATUS_TOKENS.map((t) => t.id).join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

      const res = await fetch(url, {
        method: "GET",
        // These headers help avoid CORS issues and rate-limiting
        headers: {
          accept: "application/json",
        },
        // Important: cache settings
        cache: "no-store", // Always fresh data
        // Or try: next: { revalidate: 60 } if you want ISR-like behavior
      });

      if (!res.ok) {
        console.warn("CoinGecko API error:", res.status, res.statusText);
        return;
      }

      const json = await res.json();
      setPrices(json);
    } catch (e) {
      // This catches network errors, CORS, timeouts, etc.
      console.warn("Failed to fetch prices from CoinGecko:", e);
      // Optional: fallback to empty prices or previous state
    }
  }

  fetchPrices();
  const interval = setInterval(fetchPrices, 60_000);

  return () => clearInterval(interval);
}, []);
  return (
    <>
      {/* TOP NAV BAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          background: "#000080",
          color: "white",
          padding: "4px 8px",
          fontWeight: "bold",
          fontSize: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #ffffff",
          boxShadow: "0 3px 6px rgba(0,0,0,0.4)",
          zIndex: 1000,
        }}
      >
        {/* Left: Title only (clean look) */}
        <div style={{ marginLeft: "8px" }}>DEX Arbitrage Radar</div>

        {/* Right: Buttons + Window Controls – perfectly aligned vertically */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Home Button */}
          <Link href="/">
            <button
              style={{
                background: "#c0c0c0",
                color: "#000000",
                borderTop: "2px solid #ffffff",
                borderLeft: "2px solid #ffffff",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                padding: "4px 12px",
                fontSize: "13px",
                cursor: "pointer",
                height: "26px", // ensures perfect vertical alignment
                display: "flex",
                alignItems: "center",
              }}
            >
              Home
            </button>
          </Link>

          {/* About Button */}
          {showAboutButton && onAboutClick && (
            <button
              onClick={onAboutClick}
              style={{
                background: "#c0c0c0",
                color: "#000000",
                borderTop: "2px solid #ffffff",
                borderLeft: "2px solid #ffffff",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                padding: "4px 12px",
                fontSize: "13px",
                cursor: "pointer",
                height: "26px",
                display: "flex",
                alignItems: "center",
              }}
            >
              About
            </button>
          )}

          {/* DEX Radar Button */}
          <Link href="/dexradar">
            <button
              style={{
                background: "#c0c0c0",
                color: "#000000",
                borderTop: "2px solid #ffffff",
                borderLeft: "2px solid #ffffff",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                padding: "4px 12px",
                fontSize: "13px",
                cursor: "pointer",
                height: "26px",
                display: "flex",
                alignItems: "center",
              }}
            >
              DEX Radar
            </button>
          </Link>

          {/* Classic Windows 98 Window Buttons */}
          <div style={{ display: "flex", gap: "4px" }}>
            <div
              style={{
                width: 16,
                height: 14,
                background: "#c0c0c0",
                borderTop: "2px solid #ffffff",
                borderLeft: "2px solid #ffffff",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: "3px",
              }}
            >
              <div style={{ width: 8, height: 1, background: "#000000" }}></div>
            </div>

            <div
              style={{
                width: 16,
                height: 14,
                background: "#c0c0c0",
                borderTop: "2px solid #ffffff",
                borderLeft: "2px solid #ffffff",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 9, height: 9, border: "1px solid #000000", background: "#ffffff" }}></div>
            </div>

            <div
              style={{
                width: 16,
                height: 14,
                background: "#c0c0c0",
                borderTop: "2px solid #ffffff",
                borderLeft: "2px solid #ffffff",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              X
            </div>
          </div>
        </div>
      </div>

      {/* PRICE STATUS BAR (same on both pages) */}
      <div
        style={{
          marginTop: "50px",
          background: "#c0c0c0",
          borderBottom: "2px solid #000000",
          padding: "6px 12px",
          display: "flex",
          gap: "5px",
          justifyContent: "center",
          flexWrap: "wrap",
          fontSize: "13px",
        }}
      >
        {STATUS_TOKENS.map((token) => {
          const data = prices[token.id];
          if (!data) return null;

          const change = typeof data.usd_24h_change === "number" ? data.usd_24h_change : 0;
          const up = change >= 0;

          return (
            <div
              key={token.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 6px",
                background: "#ffffff",
                color: "#000000",
                borderTop: "2px solid #000000",
                borderLeft: "2px solid #000000",
                borderRight: "2px solid #ffffff",
                borderBottom: "2px solid #ffffff",
                whiteSpace: "nowrap",
              }}
            >
              <img src={token.logo} width="14" height="14" alt="" />
              <strong>{token.symbol}</strong>
              <span style={{ color: up ? "#008000" : "#c00000", fontWeight: "bold" }}>
                {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}