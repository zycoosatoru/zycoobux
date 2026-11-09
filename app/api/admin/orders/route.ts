import { getAllOrders } from '../../../../lib/supabase';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export async function GET(request: Request) {
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

    const orders = await getAllOrders();
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const pendingOrders = orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'PAID'
    );
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price_paid || 0), 0);
    const totalRobuxDelivered = completedOrders.reduce((sum, o) => sum + (o.robux_amount || 0), 0);

    return Response.json({
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
    return Response.json(
      {
        error: 'Internal Server Error',
        message: error?.message || 'Gagal mengambil data dashboard pesanan.',
      },
      { status: 500 }
    );
  }
}
