import { ReportByWorker } from "./types/types";

export async function getReportByWorker(data: ReportByWorker) {
  const response = await fetch("/api/reports/byWorker", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dni: data.dni,
      from: data.from,
      to: data.to,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error fetching report");
  }
  return response.blob();
}
