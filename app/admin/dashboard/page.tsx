'use client';

import React from 'react';
import { AdminDashboardPage } from '../../../src/pages/AdminDashboardPage';

export default function AdminDashboard() {
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return <AdminDashboardPage navigate={navigate} />;
}
