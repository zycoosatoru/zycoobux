import dotenv from 'dotenv';
dotenv.config();
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface OrderRecord {
  id: string; // e.g. ZYC12345678
  roblox_username: string;
  roblox_display_name: string;
  roblox_user_id: string;
  robux_amount: number;
  price_paid: number;
  payment_method: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  payment_proof?: string;
  created_at?: string;
  updated_at?: string;
}

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    supabaseServiceKey &&
    supabaseServiceKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Local resilient storage fallback if Supabase environment variables are pending setup
 */
const fallbackMemoryOrders: Map<string, OrderRecord> = new Map();

// Seed initial demo orders so admin dashboard is instantly testable and rich
const demoSeedOrders: OrderRecord[] = [
  {
    id: 'ZYC83921045',
    roblox_username: 'GamerPro_Indo',
    roblox_display_name: 'ProGamer',
    roblox_user_id: '128491823',
    robux_amount: 1000,
    price_paid: 165000,
    payment_method: 'QRIS',
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ZYC49102834',
    roblox_username: 'BloxFruitMaster99',
    roblox_display_name: 'BloxMaster',
    roblox_user_id: '482910394',
    robux_amount: 500,
    price_paid: 82500,
    payment_method: 'DANA',
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ZYC91023847',
    roblox_username: 'Nusantara_Build',
    roblox_display_name: 'Nusantara',
    roblox_user_id: '928371625',
    robux_amount: 250,
    price_paid: 41250,
    payment_method: 'GOPAY',
    status: 'PENDING',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

demoSeedOrders.forEach((o) => fallbackMemoryOrders.set(o.id, o));

/**
 * Database access helpers
 */
export async function insertOrder(order: OrderRecord): Promise<OrderRecord> {
  const now = new Date().toISOString();
  const fullOrder: OrderRecord = {
    ...order,
    created_at: order.created_at || now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert([fullOrder]).select().single();
      if (error) {
        console.warn('Supabase insert warning, falling back to local memory store:', error.message);
        fallbackMemoryOrders.set(fullOrder.id, fullOrder);
        return fullOrder;
      }
      return data;
    } catch (e: any) {
      console.warn('Supabase insert exception:', e?.message);
    }
  }

  fallbackMemoryOrders.set(fullOrder.id, fullOrder);
  return fullOrder;
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error && data) {
        return data;
      }
    } catch (e) {
      // Fallback
    }
  }

  return fallbackMemoryOrders.get(id) || null;
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data;
      }
    } catch (e) {
      // Fallback
    }
  }

  return Array.from(fallbackMemoryOrders.values()).sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

export async function updateOrderStatus(
  id: string,
  newStatus: OrderRecord['status']
): Promise<OrderRecord | null> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        if (fallbackMemoryOrders.has(id)) {
          fallbackMemoryOrders.set(id, data);
        }
        return data;
      }
    } catch (e) {
      // Fallback
    }
  }

  const existing = fallbackMemoryOrders.get(id);
  if (!existing) return null;

  const updated: OrderRecord = {
    ...existing,
    status: newStatus,
    updated_at: now,
  };
  fallbackMemoryOrders.set(id, updated);
  return updated;
}

export async function uploadPaymentProof(
  id: string,
  proofData: string
): Promise<OrderRecord | null> {
  const now = new Date().toISOString();
  const existing = await getOrderById(id);
  if (!existing) return null;

  const nextStatus = existing.status === 'PENDING' ? 'PAID' : existing.status;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_proof: proofData,
          status: nextStatus,
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        if (fallbackMemoryOrders.has(id)) {
          fallbackMemoryOrders.set(id, data);
        }
        return data;
      }
    } catch (e) {
      // Fallback
    }
  }

  const updated: OrderRecord = {
    ...existing,
    payment_proof: proofData,
    status: nextStatus,
    updated_at: now,
  };
  fallbackMemoryOrders.set(id, updated);
  return updated;
}

