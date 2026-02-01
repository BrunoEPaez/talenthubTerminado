import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content" style={{ marginTop: '80px', minHeight: 'calc(100vh - 200px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/create" element={<CreateJob />} />
          <Route path="/job/:id" element={<JobDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;