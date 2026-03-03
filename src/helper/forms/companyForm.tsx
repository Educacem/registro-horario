"use client";

import React from "react";
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
} from "@mui/material";
import { getAllCompanies } from "@/servicesFront/company.services";
import { getReportByCompany } from "@/servicesFront/reportByCompany.service";

type Company = {
  id: number;
  name: string;
};

function CompanyForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>("");
  const [StartDate, setStartDate] = React.useState("");
  const [EndDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setError(null);
        const data = await getAllCompanies();
        setCompanies(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar las empresas",
        );
      }
    };
    fetchCompanies();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!selectedCompanyId) {
      setError("Por favor, selecciona una empresa.");
      return;
    }
    if (StartDate < "2026-01-01") {
      setError("La fecha no pueden ser anteriores al año 2026.");
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

      const blob = await getReportByCompany({
        companyId: parseInt(selectedCompanyId),
        from: StartDate,
        to: EndDate,
      });

      // 2) Descargarlo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_empresa_${selectedCompanyId}_${StartDate}_${EndDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("Reporte generado correctamente");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al generar el reporte",
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
        <Typography variant="h6">Formulario de empresa</Typography>
        <TextField
          select
          label="Empresa"
          fullWidth
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          disabled={companies.length === 0}
          helperText={companies.length === 0 ? "Cargando empresas..." : " "}
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </TextField>{" "}
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
        <Button
          variant="contained"
          type="submit"
          size="large"
          fullWidth
          onClick={handleSubmit}
        >
          Descargar PDF
        </Button>
      </Stack>
    </Paper>
  );
}

export default CompanyForm;
