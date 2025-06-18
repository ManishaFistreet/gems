import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/NavBar';
import CardPrint from './components/Card/CardPrint';
import QRScanner from './pages/QRScanner';
import GemStoneFormTabs from './components/Form/GemStoneFormTabs';
import PurchaseList from './pages/PurchaseList';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/fill" replace />} />
        <Route path="/fill" element={<GemStoneFormTabs />} />
        <Route path="/print" element={<CardPrint />} />
        <Route path='/purchase_list' element= {<PurchaseList />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;