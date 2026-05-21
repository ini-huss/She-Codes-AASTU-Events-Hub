import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EventDetailPage from './pages/EventDetailPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/events/:id" element={<EventDetailPage />} />
        {/* Redirect root to a sample event for easy preview */}
        <Route path="*" element={<Navigate to="/events/1" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
