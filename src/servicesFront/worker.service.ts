export async function getWorkers() {
  const response = await fetch("/api/workers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error fetching workers");
  }
  return response.json();
}
