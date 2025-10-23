import { PERMISSIONS } from '@/core/rbac';
import { respData, respErr } from '@/shared/lib/resp';
import { getRemainingCredits } from '@/shared/services/credit';
import { hasPermission } from '@/shared/services/rbac';
import { getUserInfo } from '@/shared/services/user';

export async function POST(req: Request) {
  try {
    // get sign user info
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    // get remaining credits
    const remainingCredits = await getRemainingCredits(user.id);

    // check if user is admin
    const isAdmin = await hasPermission(user.id, PERMISSIONS.ADMIN_ACCESS);

    return respData({ ...user, isAdmin, remainingCredits });
  } catch (e) {
    console.log('get user info failed:', e);
    return respErr('get user info failed');
  }
}
