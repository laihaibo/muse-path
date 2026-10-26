import type { VenueProject } from "./schema";
import ningboBotanicalGarden from "./ningbo-botanical-garden";
import ningboSmartExpo2026 from "./ningbo-smart-expo-2026";

/** 场馆项目注册表 — 新增项目：引入数据文件并加入此数组（首位为默认场馆） */
export const projects: VenueProject[] = [ningboSmartExpo2026, ningboBotanicalGarden];

export function getProject(id: string): VenueProject | undefined {
  return projects.find((p) => p.id === id);
}

export const defaultProjectId = projects[0]?.id ?? "";
