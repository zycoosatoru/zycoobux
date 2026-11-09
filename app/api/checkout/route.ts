import crypto from 'crypto';
import {
  PRICE_PER_ROBUX,
  CUSTOM_MIN_ROBUX,
  CUSTOM_MAX_ROBUX,
  CUSTOM_STEP,
  QRIS_MAX_ROBUX,
  PAYMENT_METHODS,
} from '../../../lib/config';
import { verifyRobloxAccount } from '../../../lib/roblox';
import { insertOrder, getOrderById, OrderRecord } from '../../../lib/supabase';

function generateOrderId(): string {
  const randomNum = crypto.randomInt(10000000, 99999999);
  return `ZYC${randomNum}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      displayName,
      robuxAmount,
      paymentMethod,
      agreedAge,
      agreedLimit,
    } = body;

    // 1. Mandatory checkbox checks
    if (!agreedAge || !agreedLimit) {
      return Response.json(
        {
          error: 'Syarat belum disetujui',
          message: 'Anda wajib mencentang konfirmasi usia 18+ dan pengecekan limit akun Roblox.',
        },
        { status: 400 }
      );
    }

    // 2. Validate payment method
    const validMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
    if (!validMethod) {
      return Response.json(
        {
          error: 'Metode pembayaran tidak valid',
          message: 'Pilih salah satu metode pembayaran yang tersedia.',
        },
        { status: 400 }
      );
    }

    // 3. Validate Robux amount rules
    const amountNum = Number(robuxAmount);
    if (
      !Number.isInteger(amountNum) ||
      amountNum < CUSTOM_MIN_ROBUX ||
      amountNum > CUSTOM_MAX_ROBUX ||
      amountNum % CUSTOM_STEP !== 0
    ) {
      return Response.json(
        {
          error: 'Jumlah Robux tidak valid',
          message: `Jumlah Robux harus kelipatan ${CUSTOM_STEP}, minimal ${CUSTOM_MIN_ROBUX}, dan maksimal ${CUSTOM_MAX_ROBUX.toLocaleString('id-ID')}.`,
        },
        { status: 400 }
      );
    }

    // 4. Enforce QRIS limit
    if (paymentMethod === 'QRIS' && amountNum > QRIS_MAX_ROBUX) {
      return Response.json(
        {
          error: 'Limit QRIS terlampaui',
          message: `Maksimal pembayaran melalui QRIS adalah ${QRIS_MAX_ROBUX.toLocaleString('id-ID')} Robux.`,
        },
        { status: 400 }
      );
    }

    // 5. Server-side re-verification of Roblox account
    const verifyResult = await verifyRobloxAccount(username, displayName);
    if (verifyResult.status !== 'VERIFIED' || !verifyResult.userId) {
      return Response.json(
        {
          error: 'Verifikasi akun gagal',
          message: verifyResult.message || 'Akun Roblox tidak dapat diverifikasi oleh server.',
        },
        { status: 400 }
      );
    }

    // 6. Recalculate price on server
    const pricePaid = amountNum * PRICE_PER_ROBUX;

    // 7. Generate collision-resistant Order ID
    let orderId = generateOrderId();
    let collisionCheck = await getOrderById(orderId);
    let attempts = 0;
    while (collisionCheck && attempts < 3) {
      orderId = generateOrderId();
      collisionCheck = await getOrderById(orderId);
      attempts++;
    }

    // 8. Save order
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

    return Response.json(
      {
        success: true,
        orderId: saved.id,
        redirectUrl: `/invoice/${saved.id}`,
        order: saved,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return Response.json(
      {
        error: 'Internal Server Error',
        message: error?.message || 'Gagal memproses pesanan.',
      },
      { status: 500 }
    );
  }
}
