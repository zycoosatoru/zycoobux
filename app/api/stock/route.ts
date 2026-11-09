import { getRobuxStock } from '../../../lib/stock';

export async function GET() {
  try {
    const { stock, updated_at } = await getRobuxStock();
    return Response.json({
      success: true,
      stock,
      formattedStock: stock.toLocaleString('id-ID'),
      updated_at,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error?.message || 'Gagal mengambil data stok Robux.',
      },
      { status: 500 }
    );
  }
}
