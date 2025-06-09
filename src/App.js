import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/NavBar';
import CardPrint from './components/Card/CardPrint';
import QRScanner from './pages/QRScanner';
import GemstoneForm from './components/Form/GemstoneForm';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/fill" replace />} />
        <Route path="/fill" element={<GemstoneForm />} />
        <Route path="/print" element={<CardPrint />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;