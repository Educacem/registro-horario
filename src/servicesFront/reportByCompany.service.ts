import { ReportByCompany } from "./types/types";

export async function getReportByCompany(data: ReportByCompany) {
  const response = await fetch("/api/reports/byCompany", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyId: data.companyId,
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
