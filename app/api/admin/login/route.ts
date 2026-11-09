import {
  verifyAdminCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        {
          error: 'Kredensial tidak lengkap',
          message: 'Username dan password admin wajib diisi.',
        },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return Response.json(
        {
          error: 'Login gagal',
          message: 'Username atau password admin salah.',
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);
    const maxAgeSeconds = Math.floor(SESSION_MAX_AGE_MS / 1000);
    const cookieHeader = `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login admin berhasil.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (error: any) {
    return Response.json(
      {
        error: 'Internal Server Error',
        message: error?.message || 'Gagal memproses login admin.',
      },
      { status: 500 }
    );
  }
}
