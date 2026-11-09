'use client';

import React from 'react';
import { HomePage } from '../src/pages/HomePage';

export default function Page() {
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return <HomePage navigate={navigate} />;
}
