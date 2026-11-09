export interface RobloxVerificationResult {
  status: 'VERIFIED' | 'FAILED' | 'NOT FOUND' | 'ERROR';
  userId?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  message?: string;
}

export const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

export async function verifyRobloxAccount(
  inputUsername: string,
  inputDisplayName: string
): Promise<RobloxVerificationResult> {
  const cleanUsername = (inputUsername || '').trim();
  const cleanDisplayName = (inputDisplayName || '').trim();

  // 1. Strict regex validation
  if (!USERNAME_REGEX.test(cleanUsername)) {
    return {
      status: 'FAILED',
      message: 'Format username tidak valid (hanya 3-20 karakter alfanumerik dan garis bawah).',
    };
  }

  if (!cleanDisplayName) {
    return {
      status: 'FAILED',
      message: 'Display name tidak boleh kosong.',
    };
  }

  try {
    // 2. Fetch user from official Roblox API
    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ZYCOOBUX-Verification/1.0',
      },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Roblox API responded with status ${response.status}`);
    }

    const data = await response.json();
    const user = data?.data?.[0];

    // User not found on Roblox or banned
    if (!user) {
      return {
        status: 'NOT FOUND',
        message: `Username Roblox "${cleanUsername}" tidak ditemukan.`,
      };
    }

    // 3. Exact username matching (case-insensitive name check)
    const exactNameMatch = user.name.toLowerCase() === cleanUsername.toLowerCase();
    if (!exactNameMatch) {
      return {
        status: 'NOT FOUND',
        message: `Username "${cleanUsername}" tidak cocok dengan data Roblox.`,
      };
    }

    // 4. Compare displayName case-insensitively
    const exactDisplayNameMatch =
      (user.displayName || '').trim().toLowerCase() === cleanDisplayName.toLowerCase();

    if (!exactDisplayNameMatch) {
      return {
        status: 'FAILED',
        userId: String(user.id),
        username: user.name,
        message: `Display name tidak cocok dengan akun "${user.name}". Pastikan memasukkan Display Name yang benar.`,
      };
    }

    // 5. Fetch avatar thumbnail
    let avatarUrl = '';
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar?userIds=${user.id}&size=150x150&format=Png&isCircular=false`
      );
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        avatarUrl = thumbData?.data?.[0]?.imageUrl || '';
      }
    } catch {
      // Fallback if thumbnail API has transient delay
    }

    return {
      status: 'VERIFIED',
      userId: String(user.id),
      username: user.name,
      displayName: user.displayName,
      avatarUrl: avatarUrl || 'https://tr.rbxcdn.com/30DAY-Avatar-150x150-Png',
      message: 'Akun berhasil diverifikasi!',
    };
  } catch (error: any) {
    return {
      status: 'ERROR',
      message: error?.message || 'Gagal menghubungi server Roblox. Coba lagi dalam beberapa saat.',
    };
  }
}
