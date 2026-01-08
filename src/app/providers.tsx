import { ThemeProvider, CssBaseline } from "@mui/material";
import { ReactNode } from "react";
import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
