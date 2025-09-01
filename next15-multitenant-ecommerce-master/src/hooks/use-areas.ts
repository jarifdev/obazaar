import { useState, useEffect } from "react";

export interface Area {
  id: number;
  name: string;
  state_id: number;
  wilaya_id: number;
}

export interface Wilaya {
  id: number;
  name: string;
  state_id: number;
}

export interface State {
  id: number;
  name: string;
}

export interface AreaData {
  states: State[];
  wilayas: Wilaya[];
  areas: Area[];
}

export const useAreas = () => {
  const [areaData, setAreaData] = useState<AreaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAreaData = async () => {
      try {
        setLoading(true);
        // Load the flat area data
        const response = await fetch("/areas.flat.json");
        if (!response.ok) {
          throw new Error("Failed to load area data");
        }

        const data = await response.json();

        // Extract unique states
        const statesMap = new Map<number, State>();
        const wilayasMap = new Map<number, Wilaya>();
        const areas: Area[] = [];

        data.forEach((item: any) => {
          // Add state
          if (!statesMap.has(item.state_id)) {
            statesMap.set(item.state_id, {
              id: item.state_id,
              name: item.state,
            });
          }

          // Add wilaya
          if (!wilayasMap.has(item.wilaya_id)) {
            wilayasMap.set(item.wilaya_id, {
              id: item.wilaya_id,
              name: item.wilaya,
              state_id: item.state_id,
            });
          }

          // Add area
          areas.push({
            id: item.area_id,
            name: item.area,
            state_id: item.state_id,
            wilaya_id: item.wilaya_id,
          });
        });

        setAreaData({
          states: Array.from(statesMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          wilayas: Array.from(wilayasMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          areas: areas.sort((a, b) => a.name.localeCompare(b.name)),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load area data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAreaData();
  }, []);

  const getWilayasByState = (stateId: number): Wilaya[] => {
    if (!areaData) return [];
    return areaData.wilayas.filter((w) => w.state_id === stateId);
  };

  const getAreasByWilaya = (wilayaId: number): Area[] => {
    if (!areaData) return [];
    return areaData.areas.filter((a) => a.wilaya_id === wilayaId);
  };

  return {
    areaData,
    loading,
    error,
    getWilayasByState,
    getAreasByWilaya,
  };
};
