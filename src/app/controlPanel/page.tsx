"use client";

import React from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CompanyForm from "@/helper/forms/companyForm";
import WorkerForm from "@/helper/forms/workerForm";
import LoginForm from "@/helper/forms/loginForm";
function ControlPanel() {
  const [mode, setMode] = React.useState<"empresa" | "trabajador">("empresa");
  const [isAuthed, setIsAuthed] = React.useState(false);

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: "empresa" | "trabajador" | null,
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <>
      <LoginForm open={!isAuthed} onSuccess={() => setIsAuthed(true)} />
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h4"
            fontWeight="600"
            fontFamily="monospace"
            align="center"
            gutterBottom
          >
            Panel de control
          </Typography>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Stack spacing={3}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                fullWidth
                onChange={handleChange}
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "#f5f5f5",
                  p: 0.5,
                  "& .MuiToggleButton-root": {
                    flex: 1,
                    border: 0,
                    borderRadius: "10px !important",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "text.primary",
                  },
                  "& .Mui-selected": {
                    bgcolor: "#89e37d",
                  },
                }}
              >
                <ToggleButton value="empresa">Por empresa</ToggleButton>

                <ToggleButton value="trabajador">Por trabajador</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {mode === "empresa" ? <CompanyForm /> : <WorkerForm />}
          </Paper>
        </Box>
      </Container>
    </>
  );
}

export default ControlPanel;
