export async function getAllCompanies() {
  const response = await fetch("/api/company", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error fetching companies");
  }
  return response.json();
}
