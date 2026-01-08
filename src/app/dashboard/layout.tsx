"use client";

import { Container, Box, Typography } from "@mui/material";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" align="center" gutterBottom>
            Timply
          </Typography>
          {children}
        </Box>
      </Container>
    </main>
  );
}
