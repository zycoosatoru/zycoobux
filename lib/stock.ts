import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STOCK_FILE_PATH = path.resolve(__dirname, '../data/stock.json');

// Default initial stock if file doesn't exist
const DEFAULT_INITIAL_STOCK = 48500;

interface StockData {
  stock: number;
  updated_at: string;
  last_change?: string;
}

let cachedStock: number | null = null;

/**
 * Initialize stock from file or Supabase
 */
async function loadStockFromFile(): Promise<StockData> {
  try {
    if (fs.existsSync(STOCK_FILE_PATH)) {
      const content = await fs.promises.readFile(STOCK_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (typeof parsed.stock === 'number' && !isNaN(parsed.stock)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to default
  }

  // Create default stock file
  const initialData: StockData = {
    stock: DEFAULT_INITIAL_STOCK,
    updated_at: new Date().toISOString(),
    last_change: 'Inisialisasi sistem',
  };

  try {
    const dataDir = path.dirname(STOCK_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      await fs.promises.mkdir(dataDir, { recursive: true });
    }
    await fs.promises.writeFile(STOCK_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write initial stock file:', e);
  }

  return initialData;
}

/**
 * Save stock data to disk and try Supabase if configured
 */
async function saveStockToFile(data: StockData): Promise<void> {
  try {
    const dataDir = path.dirname(STOCK_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      await fs.promises.mkdir(dataDir, { recursive: true });
    }
    await fs.promises.writeFile(STOCK_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error saving stock to file:', e);
  }

  // Optional sync to Supabase store_settings table if it exists
  if (supabase) {
    try {
      await supabase
        .from('store_settings')
        .upsert({
          key: 'robux_stock',
          value: { stock: data.stock, updated_at: data.updated_at },
          updated_at: data.updated_at,
        })
        .select();
    } catch {
      // Ignore if table doesn't exist yet
    }
  }
}

/**
 * Get current available Robux stock
 */
export async function getRobuxStock(): Promise<{ stock: number; updated_at: string }> {
  if (cachedStock !== null) {
    return { stock: cachedStock, updated_at: new Date().toISOString() };
  }

  // Check Supabase first if available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'robux_stock')
        .single();
      if (!error && data?.value?.stock !== undefined) {
        cachedStock = Number(data.value.stock);
        return {
          stock: cachedStock,
          updated_at: data.updated_at || data.value.updated_at || new Date().toISOString(),
        };
      }
    } catch {
      // Fallback to local
    }
  }

  const loaded = await loadStockFromFile();
  cachedStock = loaded.stock;
  return { stock: loaded.stock, updated_at: loaded.updated_at };
}

/**
 * Set exact available Robux stock (Admin)
 */
export async function setRobuxStock(newAmount: number, reason = 'Update manual admin'): Promise<number> {
  const cleanAmount = Math.max(0, Math.floor(newAmount));
  cachedStock = cleanAmount;

  const data: StockData = {
    stock: cleanAmount,
    updated_at: new Date().toISOString(),
    last_change: reason,
  };

  await saveStockToFile(data);
  return cleanAmount;
}

/**
 * Add Robux stock (Admin Restock)
 */
export async function addRobuxStock(addition: number, reason = 'Restock admin'): Promise<number> {
  const current = await getRobuxStock();
  const nextStock = Math.max(0, current.stock + Math.floor(addition));
  return setRobuxStock(nextStock, reason);
}

/**
 * Deduct Robux stock automatically when an order is completed
 */
export async function deductRobuxStock(amount: number, orderId: string): Promise<{ success: boolean; newStock: number }> {
  const current = await getRobuxStock();
  const deductVal = Math.max(0, Math.floor(amount));

  const nextStock = Math.max(0, current.stock - deductVal);
  await setRobuxStock(nextStock, `Pengurangan otomatis pesanan #${orderId} (${deductVal} R$)`);

  return {
    success: true,
    newStock: nextStock,
  };
}
