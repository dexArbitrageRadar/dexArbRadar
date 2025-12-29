// app/page.tsx
"use client";

import OptimalInputRadar from "./optimalinputradar";
import Header from "./components/Header";
import { useState } from "react";

export default function Page() {
  const [showAbout, setShowAbout] = useState(false);

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
      <Header onAboutClick={() => setShowAbout(true)} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "50px" }}>
        <OptimalInputRadar />
      </div>

      {/* ABOUT MODAL */}
      {showAbout && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5000,
          }}
        >
          <div
            style={{
              width: "420px",
              background: "#000000",
              color: "#ffffff",
              padding: "20px",
              position: "relative",
              border: "2px solid #ffffff",
              boxShadow: "0 0 20px rgba(0,0,0,0.8)",
            }}
          >
            <button
              onClick={() => setShowAbout(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "22px",
                height: "22px",
                background: "#c00000",
                color: "#ffffff",
                border: "2px solid #ffffff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              X
            </button>

            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>About DEX Arbitrage Radar</h3>

            <h2 style={{ fontWeight: "bold" }}>Our Mission</h2>

            <p style={{ lineHeight: "1.5", fontSize: "14px" }}>
              The challenge to get MEV on-chain is becoming increasingly competitive.
            </p>
            <br />
            <p style={{ lineHeight: "1.5", fontSize: "14px" }}>
              Our team’s intention is to innovate new ways to discover the
              <strong> optimal input amount</strong> for arbitrage opportunities,
              helping traders identify more efficient and realistic execution sizes.
            </p>
            <br/>
            <p>
              This product is still at experimental & development phase.
              Althought there are no wallet connection require,
              user must do your own research when
              interacting or trading on any DEX.
            </p>
          </div>
        </div>
      )}

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