import { verifyRobloxAccount } from '../../../lib/roblox';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, displayName } = body;

    if (!username || !displayName) {
      return Response.json(
        {
          success: false,
          status: 'FAILED',
          message: 'Username dan Display Name wajib diisi.',
        },
        { status: 400 }
      );
    }

    const result = await verifyRobloxAccount(username, displayName);

    if (result.status === 'VERIFIED') {
      return Response.json({
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

    return Response.json({
      success: false,
      status: result.status,
      message: result.message,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        status: 'ERROR',
        message: error?.message || 'Terjadi kesalahan pada server saat verifikasi akun.',
      },
      { status: 500 }
    );
  }
}
