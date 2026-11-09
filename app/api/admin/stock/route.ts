import { addRobuxStock, setRobuxStock } from '../../../../lib/stock';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
    const { valid } = verifySessionToken(token);

    if (!valid) {
      return Response.json(
        {
          error: 'Unauthorized',
          message: 'Sesi admin tidak valid atau sudah kedaluwarsa.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, mode } = body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount < 0) {
      return Response.json(
        {
          error: 'Jumlah tidak valid',
          message: 'Jumlah Robux harus berupa angka positif.',
        },
        { status: 400 }
      );
    }

    let newStock = 0;
    if (mode === 'add') {
      newStock = await addRobuxStock(numAmount, `Restock admin (+${numAmount} R$)`);
    } else {
      newStock = await setRobuxStock(numAmount, `Pengaturan manual admin (${numAmount} R$)`);
    }

    return Response.json({
      success: true,
      stock: newStock,
      formattedStock: newStock.toLocaleString('id-ID'),
      message:
        mode === 'add'
          ? `Berhasil menambahkan ${numAmount.toLocaleString('id-ID')} Robux ke stok. Stok kini ${newStock.toLocaleString('id-ID')} Robux.`
          : `Stok Robux berhasil diatur menjadi ${newStock.toLocaleString('id-ID')} Robux.`,
    });
  } catch (error: any) {
    return Response.json(
      {
        error: 'Internal Server Error',
        message: error?.message || 'Gagal memperbarui stok Robux.',
      },
      { status: 500 }
    );
  }
}
