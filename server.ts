import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

import { PRICE_PER_ROBUX, CUSTOM_MIN_ROBUX, CUSTOM_MAX_ROBUX, CUSTOM_STEP, QRIS_MAX_ROBUX, PAYMENT_METHODS } from './lib/config';
import { verifyRobloxAccount, USERNAME_REGEX } from './lib/roblox';
import {
  verifyAdminCredentials,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from './lib/auth';
import {
  insertOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  uploadPaymentProof,
  OrderRecord,
} from './lib/supabase';
import {
  getRobuxStock,
  setRobuxStock,
  addRobuxStock,
  deductRobuxStock,
} from './lib/stock';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve public static images
app.use(express.static(path.resolve(__dirname, 'public')));

// Admin authentication middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const { valid, username } = verifySessionToken(token);

  if (!valid) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Sesi admin tidak valid atau sudah kedaluwarsa. Silakan login kembali.',
    });
  }

  (req as any).adminUser = username;
  next();
}

/**
 * Generate unique Order ID: "ZYC" + 8 random digits
 */
function generateOrderId(): string {
  const randomNum = crypto.randomInt(10000000, 99999999);
  return `ZYC${randomNum}`;
}

// ================= API ROUTES =================

/**
 * POST /api/roblox-verify
 * Verifies Roblox username & display name matching
 */
app.post('/api/roblox-verify', async (req: Request, res: Response) => {
  try {
    const { username, displayName } = req.body;

    if (!username || !displayName) {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        message: 'Username dan Display Name wajib diisi.',
      });
    }

    const result = await verifyRobloxAccount(username, displayName);

    if (result.status === 'VERIFIED') {
      return res.json({
        success: true,
        status: 'VERIFIED',
        user: {
          userId: result.userId,
          username: result.username,
          displayName: result.displayName,
          avatarUrl: result.avatarUrl,
        },
        message: result.message,
      });
    }

    return res.json({
      success: false,
      status: result.status,
      message: result.message,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 'ERROR',
      message: error?.message || 'Terjadi kesalahan pada server saat verifikasi akun.',
    });
  }
});

/**
 * POST /api/checkout
 * Validates, re-verifies, recalculates price, and creates order
 */
app.post('/api/checkout', async (req: Request, res: Response) => {
  try {
    const {
      username,
      displayName,
      robuxAmount,
      paymentMethod,
      agreedAge,
      agreedLimit,
    } = req.body;

    // 1. Mandatory checkbox checks
    if (!agreedAge || !agreedLimit) {
      return res.status(400).json({
        error: 'Syarat belum disetujui',
        message: 'Anda wajib mencentang konfirmasi usia 18+ dan pengecekan limit akun Roblox.',
      });
    }

    // 2. Validate payment method
    const validMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
    if (!validMethod) {
      return res.status(400).json({
        error: 'Metode pembayaran tidak valid',
        message: 'Pilih salah satu metode pembayaran yang tersedia.',
      });
    }

    // 3. Validate Robux amount rules (integer, multiple of 50, 50 - 50.000)
    const amountNum = Number(robuxAmount);
    if (
      !Number.isInteger(amountNum) ||
      amountNum < CUSTOM_MIN_ROBUX ||
      amountNum > CUSTOM_MAX_ROBUX ||
      amountNum % CUSTOM_STEP !== 0
    ) {
      return res.status(400).json({
        error: 'Jumlah Robux tidak valid',
        message: `Jumlah Robux harus kelipatan ${CUSTOM_STEP}, minimal ${CUSTOM_MIN_ROBUX}, dan maksimal ${CUSTOM_MAX_ROBUX.toLocaleString('id-ID')}.`,
      });
    }

    // 4. Enforce QRIS limit: maximum 2,500 Robux
    if (paymentMethod === 'QRIS' && amountNum > QRIS_MAX_ROBUX) {
      return res.status(400).json({
        error: 'Limit QRIS terlampaui',
        message: `Maksimal pembayaran melalui QRIS adalah ${QRIS_MAX_ROBUX.toLocaleString('id-ID')} Robux (Rp ${(QRIS_MAX_ROBUX * PRICE_PER_ROBUX).toLocaleString('id-ID')}). Silakan pilih metode DANA, GoPay, ShopeePay, atau SeaBank untuk pesanan ini.`,
      });
    }

    // 5. Enforce real-time available stock
    const { stock: currentStock } = await getRobuxStock();
    if (amountNum > currentStock) {
      return res.status(400).json({
        error: 'Stok Robux tidak mencukupi',
        message: `Maaf, stok Robux yang tersedia saat ini hanya ${currentStock.toLocaleString('id-ID')} Robux. Silakan kurangi jumlah pesanan Anda atau tunggu admin melakukan restock.`,
      });
    }

    // 4. Server-side re-verification of Roblox account (NEVER trust client's status)
    const verifyResult = await verifyRobloxAccount(username, displayName);
    if (verifyResult.status !== 'VERIFIED' || !verifyResult.userId) {
      return res.status(400).json({
        error: 'Verifikasi akun gagal',
        message: verifyResult.message || 'Akun Roblox tidak dapat diverifikasi oleh server.',
      });
    }

    // 5. Server-side price calculation (NEVER trust client price)
    const pricePaid = amountNum * PRICE_PER_ROBUX;

    // 6. Generate collision-resistant Order ID (retry up to 3 times)
    let orderId = generateOrderId();
    let collisionCheck = await getOrderById(orderId);
    let attempts = 0;
    while (collisionCheck && attempts < 3) {
      orderId = generateOrderId();
      collisionCheck = await getOrderById(orderId);
      attempts++;
    }

    // 7. Save to Supabase (or fallback)
    const newOrder: OrderRecord = {
      id: orderId,
      roblox_username: verifyResult.username!,
      roblox_display_name: verifyResult.displayName!,
      roblox_user_id: verifyResult.userId!,
      robux_amount: amountNum,
      price_paid: pricePaid,
      payment_method: paymentMethod,
      status: 'PENDING',
    };

    const saved = await insertOrder(newOrder);

    return res.status(201).json({
      success: true,
      orderId: saved.id,
      redirectUrl: `/invoice/${saved.id}`,
      order: saved,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Gagal memproses pesanan. Silakan coba lagi.',
    });
  }
});

/**
 * GET /api/orders/:id
 * Public endpoint to fetch order details (Strict format: ^ZYC\d{8}$)
 */
app.get('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !/^ZYC\d{8}$/.test(id)) {
      return res.status(400).json({
        error: 'Format ID tidak valid',
        message: 'Format ID pesanan harus diawali ZYC diikuti 8 digit angka (contoh: ZYC12345678).',
      });
    }

    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Pesanan tidak ditemukan',
        message: `Pesanan dengan ID "${id}" tidak ditemukan dalam sistem kami.`,
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Gagal mengambil data pesanan.',
    });
  }
});

/**
 * POST /api/orders/:id/proof
 * Upload payment proof image (base64 data URL) and transition status to PAID
 */
app.post('/api/orders/:id/proof', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { proofImage } = req.body;

    if (!id || !/^ZYC\d{8}$/.test(id)) {
      return res.status(400).json({
        error: 'Format ID tidak valid',
        message: 'Format ID pesanan tidak valid.',
      });
    }

    if (!proofImage || typeof proofImage !== 'string' || proofImage.length < 20) {
      return res.status(400).json({
        error: 'Bukti bayar tidak valid',
        message: 'File bukti pembayaran wajib diunggah.',
      });
    }

    const updated = await uploadPaymentProof(id, proofImage);

    if (!updated) {
      return res.status(404).json({
        error: 'Pesanan tidak ditemukan',
        message: `Pesanan ${id} tidak ditemukan.`,
      });
    }

    return res.json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah! Status pesanan kini DIBAYAR (PAID).',
      order: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Gagal mengunggah bukti pembayaran.',
    });
  }
});

/**
 * POST /api/admin/login
 * Admin login with timing-safe comparison and HMAC token cookie
 */
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Kredensial tidak lengkap',
        message: 'Username dan password admin wajib diisi.',
      });
    }

    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return res.status(401).json({
        error: 'Login gagal',
        message: 'Username atau password admin salah.',
      });
    }

    const token = createSessionToken(username);

    // Set HTTP-only, secure in production, strict same-site cookie
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE_MS,
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Login admin berhasil.',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Gagal memproses login admin.',
    });
  }
});

/**
 * GET /api/admin/check
 * Verifies if current session cookie has valid admin authorization
 */
app.get('/api/admin/check', (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const { valid, username } = verifySessionToken(token);
  return res.json({
    authenticated: valid,
    username: valid ? username : null,
  });
});

/**
 * POST /api/admin/logout
 * Admin logout
 */
app.post('/api/admin/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  return res.json({ success: true, message: 'Logout berhasil.' });
});

/**
 * GET /api/admin/orders
 * Protected admin orders list and dashboard statistics
 */
app.get('/api/admin/orders', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();

    // Calculate luxury dashboard metrics
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'PAID');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price_paid || 0), 0);
    const totalRobuxDelivered = completedOrders.reduce((sum, o) => sum + (o.robux_amount || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        pendingCount: pendingOrders.length,
        completedCount: completedOrders.length,
        totalOrdersCount: orders.length,
        totalRobuxDelivered,
      },
      orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Gagal mengambil data dashboard pesanan.',
    });
  }
});

/**
 * PATCH /api/orders/:id
 * Protected admin status update (COMPLETED, CANCELLED, etc.)
 */
app.patch('/api/orders/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status tidak valid',
        message: `Status harus salah satu dari: ${validStatuses.join(', ')}`,
      });
    }

    // Check existing order before status update
    const existing = await getOrderById(id);
    if (!existing) {
      return res.status(404).json({
        error: 'Pesanan tidak ditemukan',
        message: `Pesanan ${id} tidak ditemukan.`,
      });
    }

    const updated = await updateOrderStatus(id, status);

    if (!updated) {
      return res.status(404).json({
        error: 'Pesanan tidak ditemukan',
        message: `Pesanan ${id} tidak ditemukan.`,
      });
    }

    // Realtime stock auto-deduction when order completed
    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      await deductRobuxStock(existing.robux_amount, existing.id);
    } else if (status === 'CANCELLED' && existing.status === 'COMPLETED') {
      // Restore stock if a completed order was cancelled
      await addRobuxStock(existing.robux_amount, `Pengembalian stok pesanan dibatalkan #${existing.id}`);
    }

    return res.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Gagal memperbarui status pesanan.',
    });
  }
});

/**
 * GET /api/stock
 * Public real-time Robux available stock endpoint
 */
app.get('/api/stock', async (_req: Request, res: Response) => {
  try {
    const { stock, updated_at } = await getRobuxStock();
    return res.json({
      success: true,
      stock,
      formattedStock: stock.toLocaleString('id-ID'),
      updated_at,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Gagal mengambil data stok Robux.',
    });
  }
});

/**
 * POST /api/admin/stock
 * Admin endpoint to add or set available Robux stock
 */
app.post('/api/admin/stock', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { amount, mode } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({
        error: 'Jumlah tidak valid',
        message: 'Jumlah Robux harus berupa angka positif.',
      });
    }

    let newStock = 0;
    if (mode === 'add') {
      newStock = await addRobuxStock(numAmount, `Restock admin (+${numAmount} R$)`);
    } else {
      newStock = await setRobuxStock(numAmount, `Pengaturan manual admin (${numAmount} R$)`);
    }

    return res.json({
      success: true,
      stock: newStock,
      formattedStock: newStock.toLocaleString('id-ID'),
      message:
        mode === 'add'
          ? `Berhasil menambahkan ${numAmount.toLocaleString('id-ID')} Robux ke stok. Stok kini ${newStock.toLocaleString('id-ID')} Robux.`
          : `Stok Robux berhasil diatur menjadi ${newStock.toLocaleString('id-ID')} Robux.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Gagal memperbarui stok Robux.',
    });
  }
});

// ================= FRONTEND MOUNTING =================
async function startServer() {
  if (!isProduction) {
    // Development mode: mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZYCOOBUX] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
