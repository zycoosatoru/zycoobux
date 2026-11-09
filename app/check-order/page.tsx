'use client';

import React from 'react';
import { CheckOrderPage } from '../../src/pages/CheckOrderPage';

export default function CheckOrder() {
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return <CheckOrderPage navigate={navigate} />;
}
