import { ethers } from "ethers";

export const CHAINS = {
  polygon: {
    id: 137,
    rpc: "https://polygon-rpc.com",
    contract: "0xPOLYGON_CONTRACT"
  },
  arbitrum: {
    id: 42161,
    rpc: "https://arb1.arbitrum.io/rpc",
    contract: "0xARBITRUM_CONTRACT"
  },
  base: {
    id: 8453,
    rpc: "https://mainnet.base.org",
    contract: "0xBASE_CONTRACT"
  }
};

export function getChainForRegion(userRegion: string) {
  return userRegion === "US" ? "base" : "polygon";
}

export async function getProvider(chain: string) {
  const config = CHAINS[chain as keyof typeof CHAINS];
  return new ethers.JsonRpcProvider(config.rpc);
}