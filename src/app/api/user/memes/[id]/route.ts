import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { findMemeById, deleteMemeById } from '@/shared/models/meme';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Not authenticated', 401);
    }

    const { id } = await params;

    if (!id) {
      return respErr('Meme ID is required', 400);
    }

    // Check if meme exists and belongs to user
    const meme = await findMemeById(id);
    if (!meme) {
      return respErr('Meme not found', 404);
    }

    if (meme.userId !== user.id) {
      return respErr('You do not have permission to delete this meme', 403);
    }

    // Delete meme (soft delete)
    await deleteMemeById(id);

    return respData({
      success: true,
      message: 'Meme deleted successfully',
    });
  } catch (e: any) {
    console.error('Failed to delete meme:', e);
    return respErr(e.message || 'Failed to delete meme');
  }
}
