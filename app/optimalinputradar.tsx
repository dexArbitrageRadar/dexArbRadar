// app/optimalinputradar.tsx
"use client";

import { useState, useRef, useEffect } from "react";

// ==================== Types & Configuration ====================
type ChainKey = "eth" | "bsc" | "arbitrum" | "optimism" | "polygon" | "base";

type Token = {
  symbol: string;
  address: string;
  decimals: number;
  logo: string;
};

const CHAINS: Record<ChainKey, {
  name: string;
  apiName: string;
  logo: string;
  tokens: Token[];
}> = {
  eth: {
    name: "Ethereum",
    apiName: "eth",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034",
    tokens: [
      { symbol: "USDT", address: "0xdac17f958d2ee523a2206206994597c13d831ec7", decimals: 6, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=034" },
      { symbol: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=034" },
      { symbol: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f", decimals: 18, logo: "https://cryptologos.cc/logos/dai-dai-logo.png?v=034" },
      { symbol: "WETH", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034" },
      { symbol: "WBTC", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", decimals: 8, logo: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png?v=034" },
      { symbol: "LINK", address: "0x514910771af9ca656af840dff83e8264ecf986ca", decimals: 18, logo: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=034" },
      { symbol: "UNI", address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", decimals: 18, logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=034" },
      { symbol: "AAVE", address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", decimals: 18, logo: "https://cryptologos.cc/logos/aave-aave-logo.png?v=034" },
    ],
  },
  bsc: {
    name: "BNB Chain",
    apiName: "bsc",
    logo: "/logo/bnb-bnb-logo.svg",
    tokens: [
      { symbol: "USDT", address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=034" },
      { symbol: "USDC", address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", decimals: 18, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=034" },
      { symbol: "BUSD", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", decimals: 18, logo: "https://cryptologos.cc/logos/binance-usd-busd-logo.png?v=034" },
      { symbol: "WBNB", address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", decimals: 18, logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=034" },
      { symbol: "BTCB", address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", decimals: 18, logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=034" },
      { symbol: "ETH", address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034" },
      { symbol: "CAKE", address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", decimals: 18, logo: "https://cryptologos.cc/logos/pancakeswap-cake-logo.png?v=034" },
      { symbol: "XVS", address: "0xcf6bb5389c92bdad6a151c7b6d2e631ee6024d4f", decimals: 18, logo: "/logo/xvs-logo.png?v=034" },
    ],
  },
  arbitrum: {
    name: "Arbitrum",
    apiName: "arbitrum",
    logo: "/logo/arbitrum-arb-logo.svg",
    tokens: [
      { symbol: "USDT", address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", decimals: 6, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=034" },
      { symbol: "USDC", address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=034" },
      { symbol: "DAI", address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", decimals: 18, logo: "https://cryptologos.cc/logos/dai-dai-logo.png?v=034" },
      { symbol: "WETH", address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034" },
      { symbol: "ARB", address: "0x912ce59144191c1204e64559fe8253a0e49e6548", decimals: 18, logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=034" },
      { symbol: "GMX", address: "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a", decimals: 18, logo: "/logo/gmx-logo.png?v=034" },
      { symbol: "LINK", address: "0xf97f4df75117a78c1a5a0dbb814af92458539fb4", decimals: 18, logo: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=034" },
    ],
  },
  optimism: {
    name: "Optimism",
    apiName: "optimism",
    logo: "/logo/optimism-ethereum-op-logo.svg",
    tokens: [
      { symbol: "USDT", address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", decimals: 6, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=034" },
      { symbol: "USDC", address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=034" },
      { symbol: "DAI", address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", decimals: 18, logo: "https://cryptologos.cc/logos/dai-dai-logo.png?v=034" },
      { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034" },
      { symbol: "OP", address: "0x4200000000000000000000000000000000000042", decimals: 18, logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=034" },
      { symbol: "LINK", address: "0x350a84e6f5d5f5e6e5c5e5c5e5c5e5c5e5c5e5c5", decimals: 18, logo: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=034" },
      { symbol: "SNX", address: "0x8700daec35af8ff88c8a0a8b8c8a0a8b8c8a0a8b", decimals: 18, logo: "https://cryptologos.cc/logos/synthetix-snx-logo.png?v=034" },
    ],
  },
  polygon: {
    name: "Polygon",
    apiName: "polygon",
    logo: "/logo/polygon-matic-logo.svg",
    tokens: [
      { symbol: "USDT", address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", decimals: 6, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=034" },
      { symbol: "USDC", address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=034" },
      { symbol: "DAI", address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", decimals: 18, logo: "https://cryptologos.cc/logos/dai-dai-logo.png?v=034" },
      { symbol: "WMATIC", address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", decimals: 18, logo: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=034" },
      { symbol: "WETH", address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034" },
      { symbol: "LINK", address: "0xb0897686c545045afc77cf20ec7a532e3120e0f1", decimals: 18, logo: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=034" },
      { symbol: "UNI", address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f", decimals: 18, logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=034" },
    ],
  },
  base: {
    name: "Base",
    apiName: "base",
    logo: "/logo/base-logo.png",
    tokens: [
      { symbol: "USDC", address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=034" },
      { symbol: "USDT", address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=034" },
      { symbol: "USDbC", address: "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=034" },
      { symbol: "DAI", address: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", decimals: 18, logo: "https://cryptologos.cc/logos/dai-dai-logo.png?v=034" },
      { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=034" },
      { symbol: "cbETH", address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18, logo: "/logo/cbeth-logo.svg?v=034" },
      { symbol: "DEGEN", address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", decimals: 18, logo: "https://cryptologos.cc/logos/degen-base-degen-logo.png?v=034" },
    ],
  },
};

const INPUT_RANGE: Record<ChainKey, { min: number; max: number }> = {
  eth: { min: 10, max: 3000 },
  bsc: { min: 100, max: 100000 },
  arbitrum: { min: 100, max: 80000 },
  optimism: { min: 100, max: 80000 },
  polygon: { min: 100, max: 100000 },
  base: { min: 100, max: 60000 },
};

// ==================== Custom Dropdowns (White Background) ====================
function CustomChainSelect({
  selectedKey,
  onSelect,
  disabled,
}: {
  selectedKey: ChainKey;
  onSelect: (key: ChainKey) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedChain = CHAINS[selectedKey];

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <label style={{ display: "block", marginBottom: "4px" }}>Chain</label>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          background: "#ffffff",
          borderTop: "2px solid #000000",
          borderLeft: "2px solid #000000",
          borderRight: "2px solid #ffffff",
          borderBottom: "2px solid #ffffff",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img src={selectedChain.logo} alt="" width="24" height="24" style={{ objectFit: "contain" }} />
        {selectedChain.name}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "#ffffff",
            borderTop: "2px solid #000000",
            borderLeft: "2px solid #000000",
            borderRight: "2px solid #ffffff",
            borderBottom: "2px solid #ffffff",
            boxShadow: "4px 4px 8px rgba(0,0,0,0.5)",
            zIndex: 20,
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {Object.entries(CHAINS).map(([key, chain]) => (
            <div
              key={key}
              onClick={() => {
                onSelect(key as ChainKey);
                setIsOpen(false);
              }}
              style={{
                padding: "6px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: key === selectedKey ? "#000080" : "#ffffff",
                color: key === selectedKey ? "#ffffff" : "#000000",
              }}
              onMouseEnter={(e) => key !== selectedKey && (e.currentTarget.style.backgroundColor = "#c0c0c0")}
              onMouseLeave={(e) => key !== selectedKey && (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              <img src={chain.logo} alt="" width="24" height="24" style={{ objectFit: "contain" }} />
              {chain.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomTokenSelect({
  selectedToken,
  onSelect,
  tokens,
  label,
  disabled,
}: {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  tokens: Token[];
  label: string;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <label style={{ display: "block", marginBottom: "4px" }}>{label}</label>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          background: "#ffffff",
          borderTop: "2px solid #000000",
          borderLeft: "2px solid #000000",
          borderRight: "2px solid #ffffff",
          borderBottom: "2px solid #ffffff",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {selectedToken.logo && <img src={selectedToken.logo} alt="" width="24" height="24" style={{ objectFit: "contain" }} />}
        {selectedToken.symbol}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "#ffffff",
            borderTop: "2px solid #000000",
            borderLeft: "2px solid #000000",
            borderRight: "2px solid #ffffff",
            borderBottom: "2px solid #ffffff",
            boxShadow: "4px 4px 8px rgba(0,0,0,0.5)",
            zIndex: 20,
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {tokens.map((token) => (
            <div
              key={token.symbol}
              onClick={() => {
                onSelect(token);
                setIsOpen(false);
              }}
              style={{
                padding: "6px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: token.symbol === selectedToken.symbol ? "#000080" : "#ffffff",
                color: token.symbol === selectedToken.symbol ? "#ffffff" : "#000000",
              }}
              onMouseEnter={(e) =>
                token.symbol !== selectedToken.symbol && (e.currentTarget.style.backgroundColor = "#c0c0c0")
              }
              onMouseLeave={(e) =>
                token.symbol !== selectedToken.symbol && (e.currentTarget.style.backgroundColor = "#ffffff")
              }
            >
              {token.logo && <img src={token.logo} alt="" width="24" height="24" style={{ objectFit: "contain" }} />}
              {token.symbol}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Helpers ====================
function formatReadable(value: number, maxDecimals = 6): string {
  if (!isFinite(value)) return "0";
  const str = value.toLocaleString("fullwide", { useGrouping: false, maximumFractionDigits: 30 });
  if (!str.includes(".")) return str;
  const [int, dec] = str.split(".");
  return `${int}.${dec.slice(0, maxDecimals)}`.replace(/\.?0+$/, "");
}

async function fetchQuote({
  apiChain,
  inToken,
  outToken,
  amountRaw,
  outDecimals,
  signal,
}: {
  apiChain: string;
  inToken: string;
  outToken: string;
  amountRaw: string;
  outDecimals: number;
  signal: AbortSignal;
}) {
  const url = `https://open-api.openocean.finance/v3/${apiChain}/quote?inTokenAddress=${inToken}&outTokenAddress=${outToken}&amount=${amountRaw}&gasPrice=5000000000`;

  try {
    const res = await fetch(url, { signal });
    if (res.status === 429) throw new Error("RATE_LIMIT_429");
    if (signal.aborted) throw new Error("Request aborted");
    if (!res.ok) return 0;
    const json = await res.json();
    if (!json?.data?.outAmount) return 0;
    return Number(json.data.outAmount) / 10 ** outDecimals;
  } catch (error: any) {
    if (error.message === "RATE_LIMIT_429" || error.name === "AbortError" || signal.aborted) throw error;
    return 0;
  }
}

async function goldenSectionSearch(
  fn: (x: number) => Promise<number>,
  a: number,
  b: number,
  maxIterations = 2,
  lookBeyond = true,
  depth = 0,
  maxDepth = 2,
  onProgress: (completed: number, totalEstimated: number) => void,
  evaluationCount: { current: number }
): Promise<{ bestX: number; bestY: number; profitable: boolean }> {
  const PHI = (1 + Math.sqrt(5)) / 2;
  let c = b - (b - a) / PHI;
  let d = a + (b - a) / PHI;

  evaluationCount.current += 2;
  onProgress(evaluationCount.current, 30);

  let fc = await fn(c);
  let fd = await fn(d);

  let iteration = 0;
  while (Math.abs(b - a) > 1e-4 && iteration < maxIterations) {
    iteration++;
    if (fc > fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - (b - a) / PHI;
      evaluationCount.current += 1;
      onProgress(evaluationCount.current, 30);
      fc = await fn(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + (b - a) / PHI;
      evaluationCount.current += 1;
      onProgress(evaluationCount.current, 30);
      fd = await fn(d);
    }
  }

  let bestX = (a + b) / 2;
  evaluationCount.current += 1;
  onProgress(evaluationCount.current, 30);
  let bestY = await fn(bestX);

  if (lookBeyond && depth < maxDepth) {
    const margin = b - a;
    const testXRight = b + margin;
    evaluationCount.current += 1;
    onProgress(evaluationCount.current, 30);
    const testYRight = await fn(testXRight);
    if (testYRight > bestY + 0.5) {
      return goldenSectionSearch(fn, b, testXRight, maxIterations, lookBeyond, depth + 1, maxDepth, onProgress, evaluationCount);
    }

    const testXLeft = Math.max(a - margin, 0.01);
    evaluationCount.current += 1;
    onProgress(evaluationCount.current, 30);
    const testYLeft = await fn(testXLeft);
    if (testYLeft > bestY + 0.5) {
      return goldenSectionSearch(fn, testXLeft, a, maxIterations, lookBeyond, depth + 1, maxDepth, onProgress, evaluationCount);
    }
  }

  return { bestX, bestY, profitable: bestY > 0.1 };
}

// ==================== Main Component ====================
export default function OptimalInputRadar() {
  const [chainKey, setChainKey] = useState<ChainKey>("bsc");
  const chain = CHAINS[chainKey];
  const tokens = chain.tokens;

  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[tokens.length > 1 ? 1 : 0]);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ bestInput: number; bestOutput: number; profitable: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const evaluationCount = useRef({ current: 0 });

  const isSameToken = fromToken.address.toLowerCase() === toToken.address.toLowerCase();
  const canScan = !loading && !isSameToken;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async function scan() {
    if (abortController.current) abortController.current.abort();
    const controller = new AbortController();
    abortController.current = controller;

    setLoading(true);
    setResult(null);
    setErrorMessage(null);
    setProgress(0);
    evaluationCount.current = { current: 0 };

    const range = INPUT_RANGE[chainKey];

    try {
      const { bestX, bestY, profitable } = await goldenSectionSearch(
        async (amount) => {
          if (controller.signal.aborted) throw new Error("Scan aborted");

          const amountRaw = amount.toFixed(fromToken.decimals > 6 ? 6 : fromToken.decimals);

          const intermediate = await fetchQuote({
            apiChain: chain.apiName,
            inToken: fromToken.address,
            outToken: toToken.address,
            amountRaw,
            outDecimals: toToken.decimals,
            signal: controller.signal,
          });

          if (controller.signal.aborted) throw new Error("Scan aborted");
          await sleep(1000);

          if (intermediate <= 0) return -Infinity;

          const intermediateRaw = intermediate.toFixed(toToken.decimals > 6 ? 6 : toToken.decimals);

          const finalBack = await fetchQuote({
            apiChain: chain.apiName,
            inToken: toToken.address,
            outToken: fromToken.address,
            amountRaw: intermediateRaw,
            outDecimals: fromToken.decimals,
            signal: controller.signal,
          });

          if (controller.signal.aborted) throw new Error("Scan aborted");
          await sleep(1000);

          return finalBack - amount;
        },
        range.min,
        range.max,
        2,
        true,
        0,
        3,
        (completed, estimatedTotal) => {
          if (!controller.signal.aborted) {
            const percent = Math.min(100, Math.round((completed / estimatedTotal) * 100));
            setProgress(percent);
          }
        },
        evaluationCount.current
      );

      if (!controller.signal.aborted) {
        setResult({ bestInput: bestX, bestOutput: bestY, profitable });
        setProgress(100);
      }
    } catch (e: any) {
      if (e.message === "RATE_LIMIT_429") {
        setErrorMessage("Hold your horses! You requested too many times. Give it a rest.");
      } else if (e.message.includes("aborted") || e.name === "AbortError") {
        // User stopped
      } else {
        console.error("Scan error:", e);
      }
    } finally {
      setLoading(false);
      abortController.current = null;
      setProgress(0);
    }
  }

  function stopScan() {
    if (abortController.current) abortController.current.abort();
    setLoading(false);
    setProgress(0);
  }

  useEffect(() => {
    if (errorMessage && errorMessage.includes("Hold your horses")) {
      const timer = setTimeout(() => setErrorMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => () => abortController.current?.abort(), []);

  useEffect(() => {
    setFromToken(tokens[0]);
    setToToken(tokens[tokens.length > 1 ? 1 : 0]);
  }, [chainKey]);

  useEffect(() => setResult(null), [chainKey, fromToken.symbol, toToken.symbol]);

  return (
    <div
      style={{
        width: "480px",
        background: "#c0c0c0",
        borderTop: "2px solid #ffffff",
        borderLeft: "2px solid #ffffff",
        borderRight: "2px solid #000000",
        borderBottom: "2px solid #000000",
        boxShadow: "6px 6px 12px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(to right, #000080, #1084d0)",
          color: "white",
          padding: "4px 8px",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Optimal Input Radar</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <div style={{ width: 16, height: 14, background: "#c0c0c0", border: "1px inset #c0c0c0", textAlign: "center" }}>
            _
          </div>
          <div style={{ width: 16, height: 14, background: "#c0c0c0", border: "1px inset #c0c0c0", textAlign: "center" }}>
            □
          </div>
          <div
            style={{
              width: 16,
              height: 14,
              background: "#c0c0c0",
              border: "1px inset #c0c0c0",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            X
          </div>
        </div>
      </div>

      <div style={{ padding: "16px", background: "#c0c0c0", color: "#000000" }}>
        <div
          style={{
            padding: "16px",
            background: "#c0c0c0",
            borderTop: "2px solid #000000",
            borderLeft: "2px solid #000000",
            borderRight: "2px solid #ffffff",
            borderBottom: "2px solid #ffffff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <CustomChainSelect selectedKey={chainKey} onSelect={setChainKey} disabled={loading} />
            <CustomTokenSelect selectedToken={fromToken} onSelect={setFromToken} tokens={tokens} label="From (Base)" disabled={loading} />
            <CustomTokenSelect selectedToken={toToken} onSelect={setToToken} tokens={tokens} label="Via (Intermediate)" disabled={loading} />

            {isSameToken && (
              <div style={{ color: "#c00000", fontWeight: "bold", textAlign: "center" }}>
                Please select different tokens!
              </div>
            )}

            {loading && (
              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>Progress ({progress}%)</label>
                <div
                  style={{
                    width: "100%",
                    height: "22px",
                    background: "#ffffff",
                    borderTop: "2px solid #000000",
                    borderLeft: "2px solid #000000",
                    borderRight: "2px solid #ffffff",
                    borderBottom: "2px solid #ffffff",
                    padding: "3px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: "#000080",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button
                onClick={scan}
                disabled={!canScan}
                style={{
                  padding: "10px 32px",
                  fontWeight: "bold",
                  background: "#c0c0c0",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                  cursor: !canScan ? "not-allowed" : "pointer",
                  opacity: !canScan ? 0.6 : 1,
                }}
              >
                Scan Arbitrage
              </button>

              {loading && (
                <button
                  onClick={stopScan}
                  style={{
                    padding: "10px 32px",
                    fontWeight: "bold",
                    background: "#c00000",
                    color: "white",
                    borderTop: "2px solid #ffffff",
                    borderLeft: "2px solid #ffffff",
                    borderRight: "2px solid #000000",
                    borderBottom: "2px solid #000000",
                    cursor: "pointer",
                  }}
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Window */}
      {result && (
        <div style={{ position: "fixed", top: "140px", left: "50%", transform: "translateX(-50%)", width: "460px", zIndex: 1000 }}>
          <div
            style={{
              background: "#c0c0c0",
              borderTop: "2px solid #ffffff",
              borderLeft: "2px solid #ffffff",
              borderRight: "2px solid #000000",
              borderBottom: "2px solid #000000",
              boxShadow: "6px 6px 12px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(to right, #000080, #1084d0)",
                color: "white",
                padding: "4px 8px",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Arbitrage Result</span>
              <button
                onClick={() => setResult(null)}
                style={{
                  width: "20px",
                  height: "18px",
                  background: "#c0c0c0",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                  fontWeight: "bold",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                X
              </button>
            </div>
            <div style={{ padding: "16px", background: "#c0c0c0", color: "#000000" }}>
              <div
                style={{
                  padding: "16px",
                  background: "#c0c0c0",
                  borderTop: "2px solid #000000",
                  borderLeft: "2px solid #000000",
                  borderRight: "2px solid #ffffff",
                  borderBottom: "2px solid #ffffff",
                }}
              >
                <p>
                  <strong>Optimal Input:</strong> {formatReadable(result.bestInput)} {fromToken.symbol}
                </p>
                <p>
                  <strong>Estimated Profit:</strong> {formatReadable(result.bestOutput)} {fromToken.symbol}
                </p>
                <p
                  style={{
                    marginTop: "16px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: result.profitable ? "#008000" : "#c00000",
                  }}
                >
                  {result.profitable ? "🟢 Profitable Arbitrage Found" : "🔴 No Profitable Opportunity"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limit Dialog */}
      {errorMessage && errorMessage.includes("Hold your horses") && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "380px", zIndex: 1000 }}>
          <div
            style={{
              background: "#c0c0c0",
              borderTop: "2px solid #ffffff",
              borderLeft: "2px solid #ffffff",
              borderRight: "2px solid #000000",
              borderBottom: "2px solid #000000",
              boxShadow: "6px 6px 12px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(to right, #c00000, #ff0000)",
                color: "white",
                padding: "4px 8px",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>⚠️ Warning</span>
              <button
                onClick={() => setErrorMessage(null)}
                style={{
                  background: "#c0c0c0",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                  width: "20px",
                  height: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>
            <div style={{ padding: "24px", background: "#c0c0c0", textAlign: "center", color: "#000000" }}>
              <p style={{ fontSize: "14px", marginBottom: "20px" }}>{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                style={{
                  padding: "8px 28px",
                  fontWeight: "bold",
                  background: "#c0c0c0",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}