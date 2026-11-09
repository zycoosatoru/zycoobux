'use client';

import React from 'react';
import { AdminLoginPage } from '../../../src/pages/AdminLoginPage';

export default function AdminLogin() {
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return <AdminLoginPage navigate={navigate} />;
}
