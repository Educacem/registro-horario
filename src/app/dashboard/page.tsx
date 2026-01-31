"use client";

import { registerWorkTime } from "@/servicesFront/workTime.service";
import { TextField, Button, Stack, Paper, Alert } from "@mui/material";
import React from "react";

export default function DashboardPage() {
  const [dni, setDni] = React.useState("");
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    // Evita el comportamiento por defecto del navegador (recargar la página)
    e.preventDefault();

    if (!dni || !date || !startTime || !endTime) {
      setError("Por favor, rellena todos los campos.");
      return;
    }
    if (startTime >= endTime) {
      setError("La hora de salida debe ser posterior a la de entrada.");
      return;
    }
    // Limpiamos mensajes previos
    setError(null);
    setSuccess(null);
    try {
      await registerWorkTime({
        dni,
        date,
        clockIn: startTime,
        clockOut: endTime,
      });

      setSuccess("Jornada registrada correctamente");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al registrar la jornada",
      );
    }
  };

  return (
    // Paper actúa como contenedor visual y como <form> a la vez.
    // Esto es la forma recomendada con Material UI para formularios.
    <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 3 }}>
      {/* Stack se usa para espaciar verticalmente los elementos
          sin tener que manejar márgenes manualmente */}
      <Stack spacing={3}>
        <TextField
          label="DNI"
          fullWidth
          onChange={(e) => setDni(e.target.value)}
        />
        <TextField
          label="Fecha"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Hora de entrada.
            type="time" usa el input nativo del navegador.
            InputLabelProps.shrink evita que el label se solape */}
        <TextField
          label="Hora de entrada"
          type="time"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 60 }}
          fullWidth
          onChange={(e) => setStartTime(e.target.value)}
        />

        <TextField
          label="Hora de salida"
          type="time"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 60 }}
          fullWidth
          onChange={(e) => setEndTime(e.target.value)}
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button variant="contained" type="submit" size="large" fullWidth>
          Registrar jornada
        </Button>
      </Stack>
    </Paper>
  );
}
