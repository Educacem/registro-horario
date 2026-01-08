"use client";

import { TextField, Button, Stack, Paper, Alert } from "@mui/material";
import React from "react";

export default function DashboardPage() {
  const [dni, setDni] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Handler central del formulario.
  // onSubmit es el punto único donde se validará y, más adelante,
  // se hará el fetch al backend.
  const handleSubmit = (e: React.FormEvent) => {
    // Evita el comportamiento por defecto del navegador (recargar la página)
    e.preventDefault();
    if (!dni || !startTime || !endTime) {
      setError("Por favor, rellena todos los campos.");
      return;
    }
    if (startTime >= endTime) {
      setError("La hora de salida debe ser posterior a la de entrada.");
      return;
    }
    setError(null);

    // De momento solo mostramos los datos para comprobar que
    // el estado se actualiza correctamente.
    console.log({ dni, startTime, endTime });
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

        {/* Hora de entrada.
            type="time" usa el input nativo del navegador.
            InputLabelProps.shrink evita que el label se solape */}
        <TextField
          label="Hora de entrada"
          type="time"
          InputLabelProps={{ shrink: true }}
          fullWidth
          onChange={(e) => setStartTime(e.target.value)}
        />

        {/* Hora de salida.
            Más adelante se validará que sea mayor que la hora de entrada */}
        <TextField
          label="Hora de salida"
          type="time"
          InputLabelProps={{ shrink: true }}
          fullWidth
          onChange={(e) => setEndTime(e.target.value)}
        />
        {error && <Alert severity="error">{error}</Alert>}

        <Button variant="contained" type="submit" size="large" fullWidth>
          Registrar jornada
        </Button>
      </Stack>
    </Paper>
  );
}
