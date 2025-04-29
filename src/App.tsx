import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import { UserProvider } from './contexts/UserContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <ConfigProvider>
      <UserProvider>
        <SocketProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
            </Routes>
          </Layout>
        </SocketProvider>
      </UserProvider>
    </ConfigProvider>
  );
}

export default App;