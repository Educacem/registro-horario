"use client";
import React, { useEffect } from "react";
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
} from "@mui/material";
import { getWorkers } from "@/servicesFront/worker.service";
import { getReportByWorker } from "@/servicesFront/reportByWorker.service";
type Worker = {
  id: number;
  name: string;
  lastName: string;
  dni: string;
};
function WorkerForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [workers, setWorkers] = React.useState<Worker[]>([]);
  const [selectedWorkerDni, setSelectedWorkerDni] = React.useState<string>("");
  const [StartDate, setStartDate] = React.useState("");
  const [EndDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setError(null);
        const data = await getWorkers();
        setWorkers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar los trabajadores",
        );
      }
    };

    fetchWorkers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!selectedWorkerDni) {
      setError("Por favor, selecciona un trabajador.");
      return;
    }
    if (StartDate < "2026-01-01") {
      setError("La fecha no pueden ser anterior al año 2026.");
      return;
    }
    if (!StartDate || !EndDate) {
      setError("Por favor, selecciona las fechas de inicio y fin.");
      return;
    }
    if (StartDate >= EndDate) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      // 1) Pedir el PDF (blob)
      const blob = await getReportByWorker({
        dni: selectedWorkerDni,
        from: StartDate,
        to: EndDate,
      });

      // 2) Descargarlo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${selectedWorkerDni}_${StartDate}_${EndDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("PDF descargado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al generar el reporte",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      component="form"
      elevation={3}
      sx={{ p: 3, m: 1 }}
      onSubmit={handleSubmit}
    >
      <Stack spacing={3}>
        <Typography variant="h6">Formulario de trabajador</Typography>

        <TextField
          select
          label="Trabajador"
          fullWidth
          value={selectedWorkerDni}
          onChange={(e) => setSelectedWorkerDni(e.target.value)}
          disabled={workers.length === 0}
          helperText={workers.length === 0 ? "Cargando trabajadores..." : " "}
        >
          {workers.map((worker) => (
            <MenuItem key={worker.id} value={worker.dni}>
              {worker.name} {worker.lastName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Fecha de inicio"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={StartDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          type="date"
          label="Fecha de fin"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={EndDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        {loading && <Alert severity="info">Generando reporte...</Alert>}

        <Button variant="contained" type="submit" size="large" fullWidth>
          Descargar PDF
        </Button>
      </Stack>
    </Paper>
  );
}

export default WorkerForm;
