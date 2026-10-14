import axios from "axios";
import type { SunCycleParams, SunCycleResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function fetchSunCycle(params: SunCycleParams): Promise<SunCycleResponse> {
  const res = await axios.get<SunCycleResponse>(`${API_URL}/api/sun_cycle`, { params });
  return res.data;
}
