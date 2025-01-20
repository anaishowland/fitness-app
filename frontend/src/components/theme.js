import { createTheme } from "@mui/material/styles";


// export const lightTheme = createTheme({
//   palette: {
//     mode: "light",
//     primary: {
//       main: "#1976d2", // Customize primary color
//     },
//     background: {
//       default: "#f4f4f4",
//       paper: "#fff",
//     },
//     text: {
//       primary: "#000",
//     },
//   },
// });


export const darkTheme = createTheme({
   palette: {
     mode: "dark",
     background: {
       default: "#121212", // Dark background
       paper: "#1e1e1e", // Slightly lighter for paper elements
     },
     text: {
       primary: "#ffffff", // White text
       secondary: "#aaaaaa", // Slightly muted text
     },
     primary: {
       main: "#90caf9", // Light blue for primary elements
     },
     success: {
       main: "#66bb6a", // Light green for success elements
     },
   },
   typography: {
     fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
   },
 });



