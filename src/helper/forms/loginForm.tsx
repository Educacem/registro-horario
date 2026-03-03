"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

type LoginFormProps = {
  open: boolean;
  onSuccess: () => void; // se ejecuta cuando login OK
};

function LoginForm({ open, onSuccess }: LoginFormProps) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Introduce usuario y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // importante para cookies: en same-origin suele bastar, pero lo dejamos explícito
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Credenciales inválidas");
      }

      // OK: el servidor habrá seteado cookie httpOnly
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      // Bloquea cierre por click fuera / ESC
      onClose={() => {}}
      disableEscapeKeyDown
      fullWidth
      maxWidth="xs"
    >
      <form onSubmit={handleLogin}>
        <DialogTitle>
          <Typography fontWeight={700}>Iniciar sesión</Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              fullWidth
              disabled={loading}
            />

            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
              disabled={loading}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LoginForm;
