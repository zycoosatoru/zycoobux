'use client';

import React, { use } from 'react';
import { InvoicePage } from '../../../src/pages/InvoicePage';

export default function Invoice({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Support both Next.js 14 sync params and Next.js 15 Promise params
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const orderId = resolvedParams?.id || '';

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return <InvoicePage orderId={orderId} navigate={navigate} />;
}
