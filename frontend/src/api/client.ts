import axios from "axios";
import type { SunCycleDay, SunCycleParams } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function fetchSunCycle(params: SunCycleParams): Promise<SunCycleDay[]> {
  const res = await axios.get<SunCycleDay[]>(`${API_URL}/api/sun_cycle`, { params });
  return res.data;
}
