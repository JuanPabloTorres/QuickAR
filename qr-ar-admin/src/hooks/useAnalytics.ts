import analyticsService from "@/services/analyticsService";
import {
  AnalyticsSummary,
  DeviceStats,
  ExperienceStats,
  TimeSeriesData,
} from "@/types";
import { useEffect, useState } from "react";

export interface UseAnalyticsReturn {
  summary: AnalyticsSummary | null;
  deviceStats: DeviceStats[];
  timeSeriesData: TimeSeriesData[];
  topExperiences: ExperienceStats[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(autoLoad: boolean = true): UseAnalyticsReturn {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topExperiences, setTopExperiences] = useState<ExperienceStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [summaryRes, devicesRes, timeSeriesRes, topExpRes] =
        await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getDeviceStats(),
          analyticsService.getTimeSeriesData(7), // Last 7 days
          analyticsService.getTopExperiences(10),
        ]);

      // Handle summary
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        console.error("Failed to fetch summary:", summaryRes.message);
      }

      // Handle device stats
      if (devicesRes.success && devicesRes.data) {
        setDeviceStats(devicesRes.data);
      } else {
        console.error("Failed to fetch device stats:", devicesRes.message);
      }

      // Handle time series
      if (timeSeriesRes.success && timeSeriesRes.data) {
        setTimeSeriesData(timeSeriesRes.data);
      } else {
        console.error("Failed to fetch time series:", timeSeriesRes.message);
      }

      // Handle top experiences
      if (topExpRes.success && topExpRes.data) {
        setTopExperiences(topExpRes.data);
      } else {
        console.error("Failed to fetch top experiences:", topExpRes.message);
      }
    } catch (err: any) {
      console.error("Error fetching analytics data:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad]);

  return {
    summary,
    deviceStats,
    timeSeriesData,
    topExperiences,
    isLoading,
    error,
    refetch: fetchData,
  };
}
