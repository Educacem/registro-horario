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
          <Typography
            variant="h3"
            fontWeight={"400"}
            fontFamily={"monospace"}
            align="center"
            gutterBottom
          >
            Educacem Academy
          </Typography>
          {children}
        </Box>
      </Container>
    </main>
  );
}
