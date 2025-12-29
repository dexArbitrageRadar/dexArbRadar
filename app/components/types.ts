// app/types.ts
export type PathConfig = {
  type: "v2" | "v3" | "cv3" | "pcv3";
  router: string;
  quoter?: string;
  fee?: number;
  label: string;
};

export type PairConfig = {
  key: string;
  pairName: string;
  chain: string;
  rpc: string;
  token0: { symbol: string; address: string; decimals: number };
  token1: { symbol: string; address: string; decimals: number };
  paths: [PathConfig, PathConfig]; // exactly two paths
};