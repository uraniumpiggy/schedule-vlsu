import React from 'react';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const theme = createTheme({
  palette: {
    white: {
      main: '#fff',
      contrastText: '#fff',
    },
  },
});

export default function MenuButton() {

    return (
        <ThemeProvider theme={theme}>
            <Button color="white" endIcon={ <KeyboardArrowDownIcon /> }> 
                ВТ-219 
            </Button>
        </ThemeProvider>
    )
}
