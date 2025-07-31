import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/NavBar';
import CardPrint from './components/Card/CardPrint';
import QRScanner from './pages/QRScanner';
import GemStoneFormTabs from './components/Form/GemStoneFormTabs';
import PurchaseList from './pages/PurchaseList';
import Login from './pages/Login';
import PrivateRoute from './PrivateRoute';
import Register from './pages/Register';

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/fill"
          element={
            <PrivateRoute>
              <GemStoneFormTabs />
            </PrivateRoute>
          }
        />
        <Route
          path="/print"
          element={
            <PrivateRoute>
              <CardPrint />
            </PrivateRoute>
          }
        />
        <Route
          path="/purchase_list"
          element={
            <PrivateRoute>
              <PurchaseList />
            </PrivateRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <PrivateRoute>
              <QRScanner />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;