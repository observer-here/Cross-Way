import { request } from "./client";
import type { ChainConfig } from "./types";

export function getConfig() {
  return request<ChainConfig>("/v1/config");
}
