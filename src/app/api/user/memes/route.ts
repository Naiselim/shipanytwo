import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { getMemes, getMemesCount } from '@/shared/models/meme';

export async function GET(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Not authenticated', 401);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    const [memes, total] = await Promise.all([
      getMemes({
        userId: user.id,
        page,
        limit,
        getUser: false,
      }),
      getMemesCount({ userId: user.id }),
    ]);

    return respData({
      memes,
      total,
      page,
      limit,
      hasMore: total > page * limit,
    });
  } catch (e: any) {
    console.error('Failed to get memes:', e);
    return respErr(e.message || 'Failed to retrieve memes');
  }
}
