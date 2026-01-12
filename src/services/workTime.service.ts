export async function registerWorkTime(data: {
  dni: string;
  date: string;
  clockIn: string;
  clockOut: string;
}) {
  const response = await fetch("/api/work-time", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dni: data.dni,
      date: data.date,
      clockIn: data.clockIn,
      clockOut: data.clockOut,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error registering work time");
  }
  return response.json();
}
