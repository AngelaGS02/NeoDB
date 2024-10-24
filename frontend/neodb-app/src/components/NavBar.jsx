import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          My Neo4j App
        </Typography>
        <Button color="inherit" component={NavLink} to="/upload">
          Cargar CSV
        </Button>
        <Button color="inherit" component={NavLink} to="/crud">
          CRUD
        </Button>
        <Button color="inherit" component={NavLink} to="/applications-by-technology">
          Aplicaciones por Tecnología
        </Button>
        <Button color="inherit" component={NavLink} to="/similar-applications">
          Aplicaciones Similares
        </Button>
        <Button color="inherit" component={NavLink} to="/creator-applications">
          Aplicaciones por Creador
        </Button>
        <Button color="inherit" component={NavLink} to="/top-technologies">
          Top Tecnologías
        </Button>
        <Button color="inherit" component={NavLink} to="/unconnected-creators">
          Creadores No Conectados
        </Button>
        <Button color="inherit" component={NavLink} to="/applications-by-region">
          Aplicaciones por Región
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
