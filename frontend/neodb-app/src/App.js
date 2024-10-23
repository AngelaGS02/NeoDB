import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UploadComponent from './components/UploadComponent';
import CrudComponent from './components/CrudComponent';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/upload" element={<UploadComponent />} />
        <Route path="/crud" element={<CrudComponent />} />
      </Routes>
    </Router>
  );
};

export default App;
