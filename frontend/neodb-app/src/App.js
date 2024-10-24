import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar'; // Importa el Navbar
import UploadComponent from './components/UploadComponent';
import CrudComponent from './components/CrudComponent';
import ApplicationByTechnology from './components/ApplicationByTechnology';
import SimilarApplications from './components/SimilarApplications';
import CreatorApplications from './components/CreatorApplications';
import TopTechnologies from './components/TopTechnologies';
import UnconnectedCreators from './components/UnconnectedCreators';
import ApplicationsByRegion from './components/ApplicationsByRegion';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/upload" element={<UploadComponent />} />
        <Route path="/crud" element={<CrudComponent />} />
        <Route path="/applications-by-technology" element={<ApplicationByTechnology />} />
        <Route path="/similar-applications" element={<SimilarApplications />} />
        <Route path="/creator-applications" element={<CreatorApplications />} />
        <Route path="/top-technologies" element={<TopTechnologies />} />
        <Route path="/unconnected-creators" element={<UnconnectedCreators />} />
        <Route path="/applications-by-region" element={<ApplicationsByRegion />} />
      </Routes>
    </Router>
  );
};

export default App;
