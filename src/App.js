import logo from './logo.svg';
import './App.css';
import Box from "@mui/material/Box";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from 'notistack';

import Home from "./Home";
import { Wallets } from './components/wallet'


function App() {
  return (
    <BrowserRouter>
      <Box paddingY={6} paddingX={2}>
        <SnackbarProvider>
          <Wallets>
            <Home />
          </Wallets>
        </SnackbarProvider>
      </Box>
    </BrowserRouter>
  );
}

export default App;
