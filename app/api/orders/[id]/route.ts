import { getOrderById, updateOrderStatus } from '../../../../lib/supabase';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = typeof (params as any)?.then === 'function' ? await params : params;
    const id = (resolvedParams as { id: string })?.id;

    if (!id || !/^ZYC\d{8}$/.test(id)) {
      return Response.json(
        {
          error: 'Format ID tidak valid',
          message: 'Format ID pesanan harus diawali ZYC diikuti 8 digit angka.',
        },
        { status: 400 }
      );
    }

    const order = await getOrderById(id);

    if (!order) {
      return Response.json(
        {
          error: 'Pesanan tidak ditemukan',
          message: `Pesanan dengan ID "${id}" tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    return Response.json({ success: true, order });
  } catch (error: any) {
    return Response.json(
      {
        error: 'Internal Server Error',
        message: error?.message || 'Gagal mengambil data pesanan.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = typeof (params as any)?.then === 'function' ? await params : params;
    const id = (resolvedParams as { id: string })?.id;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return Response.json(
        {
          error: 'Status tidak valid',
          message: `Status harus salah satu dari: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status);

    if (!updated) {
      return Response.json(
        {
          error: 'Pesanan tidak ditemukan',
          message: `Pesanan ${id} tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    return Response.json({ success: true, order: updated });
  } catch (error: any) {
    return Response.json(
      {
        error: 'Internal Server Error',
        message: error?.message || 'Gagal memperbarui status pesanan.',
      },
      { status: 500 }
    );
  }
}
