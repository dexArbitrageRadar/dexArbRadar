// components/ArbCard.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
// import Chart from "chart.js/auto";
import { ethers } from "ethers";

type PathConfig = {
  type: "v2" | "v3" | "cv3" |"pcv3";
  router: string;        // V2 router OR V3 SwapRouter02
  quoter?: string;       // Only for V3
  fee?: number;          // Only for V3 (in bps: 500 = 0.05%)
  label: string;         // e.g. "Uniswap V2", "Uniswap V3 0.05%", "SushiSwap"
};

type PairConfig = {
  key: string;
  pairName: string;
  chain: string;
  rpc: string;
  token0: { symbol: string; address: string; decimals: number };
  token1: { symbol: string; address: string; decimals: number };
  paths: [PathConfig, PathConfig]; // exactly 2 paths to compare
};

type Props = {
  config: PairConfig;
};

export default function ArbCard({ config }: Props) {
  const { pairName, rpc, token0, token1, paths } = config;
  const [pathA, pathB] = paths;

  const [minInput, setMinInput] = useState(1000);
  const [maxInput, setMaxInput] = useState(50000);
  const [direction, setDirection] = useState<"A→B" | "B→A">("A→B");
  const [isToken0Base, setIsToken0Base] = useState(true);

  const [optimalInput, setOptimalInput] = useState<number | null>(null);
  const [optimalProfit, setOptimalProfit] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [countdownWidth, setCountdownWidth] = useState(100);
  const [timer, setTimer] = useState(90);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const chartRef = useRef<Chart | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const inputs = useRef<number[]>([]);
  const profits = useRef<number[]>([]);

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(rpc), [rpc]);

  // Build contracts dynamically
  const contractA = useMemo(() => {

    if (pathA.type === "v2") {
      return new ethers.Contract(pathA.router, [
        "function getAmountsOut(uint amountIn, address[] path) view returns (uint[])"
      ], provider);
    }  else if (pathA.type === "v3") {
      return new ethers.Contract(pathA.quoter!, [
        "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256)"
      ], provider);
    }else if (pathA.type === "pcv3") {
      return new ethers.Contract(pathA.quoter!, [

          {
            "inputs": [
              {
                "components": [
                  { "internalType": "address", "name": "tokenIn", "type": "address" },
                  { "internalType": "address", "name": "tokenOut", "type": "address" },
                  { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
                  { "internalType": "uint24", "name": "fee", "type": "uint24" },
                  { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
                ],
                "internalType": "struct IQuoterV2.QuoteExactInputSingleParams",
                "name": "params",
                "type": "tuple"
              }
            ],
            "name": "quoteExactInputSingle",
            "outputs": [
              { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
              { "internalType": "uint160", "name": "sqrtPriceX96After", "type": "uint160" },
              { "internalType": "uint32", "name": "initializedTicksCrossed", "type": "uint32" },
              { "internalType": "uint256", "name": "gasEstimate", "type": "uint256" }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          }

      ], provider);
    }else {
      return new ethers.Contract(pathA.quoter!, [
        "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256, uint16)"
      ], provider);
    }
  }, [pathA, provider]);

  const contractB = useMemo(() => {
    if (pathB.type === "v2") {
      return new ethers.Contract(pathB.router, [
        "function getAmountsOut(uint amountIn, address[] path) view returns (uint[])"
      ], provider);
    } else if (pathB.type === "v3") {
      return new ethers.Contract(pathB.quoter!, [
        "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256)"
      ], provider);
    }else if (pathB.type === "pcv3") {
      return new ethers.Contract(pathB.quoter!, [
  {
            "inputs": [
              {
                "components": [
                  { "internalType": "address", "name": "tokenIn", "type": "address" },
                  { "internalType": "address", "name": "tokenOut", "type": "address" },
                  { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
                  { "internalType": "uint24", "name": "fee", "type": "uint24" },
                  { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
                ],
                "internalType": "struct IQuoterV2.QuoteExactInputSingleParams",
                "name": "params",
                "type": "tuple"
              }
            ],
            "name": "quoteExactInputSingle",
            "outputs": [
              { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
              { "internalType": "uint160", "name": "sqrtPriceX96After", "type": "uint160" },
              { "internalType": "uint32", "name": "initializedTicksCrossed", "type": "uint32" },
              { "internalType": "uint256", "name": "gasEstimate", "type": "uint256" }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          }


      ], provider);
    }else {
      return new ethers.Contract(pathB.quoter!, [
        "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256, uint16)"
      ], provider);
    }
  }, [pathB, provider]);

  // Auto-adjust min/max
  useEffect(() => {
    const baseIsStable = ["USDC", "DAI", "USDT", "USDe", "crvUSD"].includes(
      isToken0Base ? token0.symbol : token1.symbol
    );
    if (isToken0Base) {
      setMinInput(baseIsStable ? 1000 : 0.5);
      setMaxInput(baseIsStable ? 200000 : 100);
    } else {
      setMinInput(baseIsStable ? 1000 : 0.1);
      setMaxInput(baseIsStable ? 200000 : 50);
    }
  }, [isToken0Base, token0.symbol, token1.symbol]);

  useEffect(() => {
    setCountdownWidth(100);
    setTimer(90);

    const interval = setInterval(() => {
      setCountdownWidth(prev => {
        if (prev <= 100 / 90) {
          // Countdown finished → reset + trigger scan
          setCountdownWidth(100);
          setTimer(90);
          return 100;
        }
        return prev - 100 / 90;
      });

      setTimer(prev => {
        if (prev <= 1) {
          // This is the exact moment the countdown ends
          runSearch();  // ← Start scan only here!
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.key]);

  // Auto scan
  useEffect(() => {
    runSearch();
    const interval = setInterval(runSearch, 90000);
    return () => clearInterval(interval);
  }, [config, direction, isToken0Base, minInput, maxInput]);

  const getAmountOut = async (
    path: PathConfig,
    contract: ethers.Contract,
    amountIn: ethers.BigNumber,
    tokenIn: string,
    tokenOut: string
  ): Promise<ethers.BigNumber> => {
    if (path.type === "v2") {
      const amounts = await contract.getAmountsOut(amountIn, [tokenIn, tokenOut]);
      return amounts[1];
    } 

    else if (path.type === "v3") {
      const amounts = await contract.callStatic.quoteExactInputSingle(
        tokenIn,
        tokenOut,
        path.fee!,
        amountIn,
        0
      );

      return amounts;
    }else if (path.type === "pcv3") {

      
      const amounts = await contract.callStatic.quoteExactInputSingle({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountIn: amountIn,
        fee: path.fee,
        sqrtPriceLimitX96: 0
      });
      
  

      return amounts[0];
    }else{
      const amounts =  await contract.callStatic.quoteExactInputSingle(
        tokenIn,
        tokenOut,
        path.fee!,
        amountIn,
        0
      );
      return amounts[0];
    }
  };

const getProfit = async (amount: number): Promise<number> => {
  const controller = abortController.current;
  if (controller?.signal.aborted) throw new Error("Aborted");

  // CRITICAL FIX: Round to token's decimals BEFORE parsing
  const roundedAmount = Number(amount.toFixed(isToken0Base ? token0.decimals : token1.decimals));

  const amountIn = isToken0Base
    ? ethers.utils.parseUnits(roundedAmount.toString(), token0.decimals)
    : ethers.utils.parseUnits(roundedAmount.toString(), token1.decimals);

  const tokenIn = isToken0Base ? token0.address : token1.address;
  const tokenOut = isToken0Base ? token1.address : token0.address;

  let finalOut: ethers.BigNumber;

  if (direction === "A→B") {
    const mid = await getAmountOut(pathA, contractA, amountIn, tokenIn, tokenOut);
    finalOut = await getAmountOut(pathB, contractB, mid, tokenOut, tokenIn);
  } else {
    const mid = await getAmountOut(pathB, contractB, amountIn, tokenIn, tokenOut);
    finalOut = await getAmountOut(pathA, contractA, mid, tokenOut, tokenIn);
  }

  const profitRaw = finalOut.sub(amountIn);
  return Number(
    ethers.utils.formatUnits(profitRaw, isToken0Base ? token0.decimals : token1.decimals)
  );
};
  const runSearch = async () => {
    if (abortController.current) abortController.current.abort();
    const controller = new AbortController();
    abortController.current = controller;

    setScanProgress(0);
    setOptimalInput(null);
    setOptimalProfit(null);
    inputs.current = [];
    profits.current = [];
    // if (chartRef.current) chartRef.current.destroy();

    try {
      const steps = 8;
      for (let i = 0; i <= steps; i++) {
        if (controller.signal.aborted) return;
        const x = minInput + (maxInput - minInput) * (i / steps);
        inputs.current.push(x);
        profits.current.push(await getProfit(x));
        setScanProgress(Math.round(((i + 1) / (steps + 1)) * 50));
        await new Promise(r => setTimeout(r, 1));
      }

      const phi = (1 + Math.sqrt(5)) / 2;
      let a = minInput, b = maxInput;
      for (let i = 0; i < 14; i++) {
        if (controller.signal.aborted) return;
        const c = b - (b - a) / phi;
        const d = a + (b - a) / phi;
        if ((await getProfit(c)) > (await getProfit(d))) b = d;
        else a = c;
        setScanProgress(50 + Math.round((i + 1) * 3.57));
      }

      const bestInput = (a + b) / 2;
      const bestProfit = await getProfit(bestInput);

      if (!controller.signal.aborted) {
        setOptimalInput(bestInput);
        setOptimalProfit(bestProfit);
        setScanProgress(100);

        // if (canvasRef.current) {
        //   chartRef.current = new Chart(canvasRef.current, {
        //     type: "line",
        //     data: {
        //       labels: inputs.current,
        //       datasets: [{
        //         data: profits.current,
        //         borderColor: (bestProfit > 0 ? "#00f2a4" : "#ff3b6d"),
        //         backgroundColor: "rgba(0, 242, 164, 0.15)",
        //         fill: true,
        //         tension: 0.4,
        //         borderWidth: 2.5,
        //         pointRadius: 0,
        //       }]
        //     },
        //     options: {
        //       responsive: true,
        //       maintainAspectRatio: false,
        //       animation: false,
        //       plugins: { legend: { display: false } },
        //       scales: { x: { display: false }, y: { display: false } },
        //     },
        //   });
        // }
      }
    } catch (err: any) {
      if (err.message !== "Aborted") console.warn("Scan error:", err);
    } finally {
      setScanProgress(0);
    }
  };

  const handleRefresh = () => {
    if (abortController.current) abortController.current.abort();
    // Only manual refresh resets the countdown
    setCountdownWidth(100);
    setTimer(90);
    runSearch();
  };

  const currentBaseSymbol = isToken0Base ? token0.symbol : token1.symbol;
  const directionLabel = direction === "A→B"
    ? `${pathA.label} → ${pathB.label}`
    : `${pathB.label} → ${pathA.label}`;

  return (
    <div style={{
      width: "320px",
      background: "#c0c0c0",
      borderTop: "2px solid #ffffff",
      borderLeft: "2px solid #ffffff",
      borderRight: "2px solid #000000",
      borderBottom: "2px solid #000000",
      boxShadow: "6px 6px 12px rgba(0,0,0,0.6)",
      color: "#000000",
    }}>
      <div style={{
        background: "linear-gradient(to right, #000080, #1084d0)",
        color: "white",
        padding: "4px 8px",
        fontWeight: "bold",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>{pairName}</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <div style={{ width: 16, height: 14, background: "#c0c0c0", border: "1px inset #c0c0c0", textAlign: "center" }}>_</div>
          <div style={{ width: 16, height: 14, background: "#c0c0c0", border: "1px inset #c0c0c0", textAlign: "center" }}>□</div>
          <div style={{ width: 16, height: 14, background: "#c0c0c0", border: "1px inset #c0c0c0", fontWeight: "bold", textAlign: "center" }}>X</div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{
          padding: "16px",
          background: "#c0c0c0",
          borderTop: "2px solid #000000",
          borderLeft: "2px solid #000000",
          borderRight: "2px solid #ffffff",
          borderBottom: "2px solid #ffffff",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button
                onClick={() => { setDirection(prev => prev === "A→B" ? "B→A" : "A→B"); handleRefresh(); }}
                style={{
                  padding: "10px 32px",
                  fontWeight: "bold",
                  background: "#c0c0c0",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                  cursor: "pointer",
                }}
              >
                {directionLabel}
              </button>
              <button
                onClick={() => { setIsToken0Base(prev => !prev); handleRefresh(); }}
                style={{
                  padding: "10px 32px",
                  fontWeight: "bold",
                  background: "#c0c0c0",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                  cursor: "pointer",
                }}
              >
                {currentBaseSymbol}
              </button>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Min Input</label>
                <input
                  type="number"
                  value={minInput}
                  onChange={(e) => { setMinInput(+e.target.value); handleRefresh(); }}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "#ffffff",
                    borderTop: "2px solid #000000",
                    borderLeft: "2px solid #000000",
                    borderRight: "2px solid #ffffff",
                    borderBottom: "2px solid #ffffff",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Max Input</label>
                <input
                  type="number"
                  value={maxInput}
                  onChange={(e) => { setMaxInput(+e.target.value); handleRefresh(); }}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "#ffffff",
                    borderTop: "2px solid #000000",
                    borderLeft: "2px solid #000000",
                    borderRight: "2px solid #ffffff",
                    borderBottom: "2px solid #ffffff",
                  }}
                />
              </div>
            </div>

            <div style={{ height: "128px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {optimalProfit === null ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "18px", fontWeight: "bold" }}>Scanning...</p>
                </div>
              ) : (
                <div style={{
                  textAlign: "center",
                  width: "100%",
                  padding: "16px",
                  background: optimalProfit > 0 ? "#008000" : "#c00000",
                  color: "#ffffff",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                }}>
                  <p><strong>Best Size:</strong> {optimalInput?.toFixed(isToken0Base ? 0 : 4)} {currentBaseSymbol}</p>
                  <p><strong>Profit:</strong> {optimalProfit > 0 ? "+" : ""}{optimalProfit.toFixed(isToken0Base ? 1 : 6)} {currentBaseSymbol}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px" }}>Next scan in</span>
                <span style={{ fontSize: "14px" }}>{timer}s</span>
              </div>
              <div style={{
                height: "20px",
                background: "#ffffff",
                borderTop: "2px solid #000000",
                borderLeft: "2px solid #000000",
                borderRight: "2px solid #ffffff",
                borderBottom: "2px solid #ffffff",
                position: "relative",
              }}>
                <div style={{
                  width: `${countdownWidth}%`,
                  height: "100%",
                  background: "#000080",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            <button
              onClick={handleRefresh}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "10px",
                fontWeight: "bold",
                background: "#c0c0c0",
                borderTop: "2px solid #ffffff",
                borderLeft: "2px solid #ffffff",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                cursor: "pointer",
              }}
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ChainLogo stays the same
function ChainLogo({ rpc, size = 22 }: { rpc: string; size?: number }) {
  const getChainFromRpc = (rpc: string) => {
    const url = rpc.toLowerCase();
    if (url.includes("arbitrum") || url.includes("arb")) return "arbitrum";
    if (url.includes("optimism") || url.includes("opt")) return "optimism";
    if (url.includes("polygon") || url.includes("matic")) return "polygon";
    if (url.includes("bnb") || url.includes("bsc")) return "bnb";
    if (url.includes("base")) return "base";
    return "ethereum";
  };

  const chain = getChainFromRpc(rpc);
  const logos: Record<string, string> = {
    ethereum: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034",
    arbitrum: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=034",
    optimism: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=034",
    polygon: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=034",
    bnb: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=034",
    base: "https://cryptologos.cc/logos/base-base-logo.png?v=034",
  };

  return <img src={logos[chain] || logos.ethereum} alt={chain} width={size} height={size} style={{ objectFit: "contain" }} />;
}