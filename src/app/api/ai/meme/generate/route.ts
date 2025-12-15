import { nanoid } from 'nanoid';

import { envConfigs } from '@/config';
import { AIMediaType } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { createMeme, NewMeme } from '@/shared/models/meme';
import { getRemainingCredits } from '@/shared/models/credit';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import { getStorageService } from '@/shared/services/storage';
import { consumeCredits } from '@/shared/models/credit';

const MEME_GENERATION_COST = 2;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const provider = (formData.get('provider') as string) || 'gemini';

    console.log('[Meme Generation] Starting request...');

    if (!file) {
      throw new Error('Image file is required');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Get current user
    const user = await getUserInfo();
    if (!user) {
      throw new Error('Please sign in to generate memes');
    }
    console.log('[Meme Generation] User:', user.id);

    // Check credits
    const remainingCredits = await getRemainingCredits(user.id);
    console.log('[Meme Generation] Remaining credits:', remainingCredits);
    if (remainingCredits < MEME_GENERATION_COST) {
      throw new Error('Insufficient credits. Please purchase more credits.');
    }

    // Get AI service
    const aiService = await getAIService();
    const aiProvider = aiService.getProvider(provider);
    if (!aiProvider) {
      throw new Error(`Provider ${provider} not available`);
    }
    console.log('[Meme Generation] AI provider ready');

    // Convert file to buffer and base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    console.log('[Meme Generation] Image converted to base64');

    // Generate meme using Gemini
    const prompt =
      'A dense sticker collage featuring multiple different versions of the character shown in the reference image. The character should be depicted in a cute, chibi-style cartoon, including dozens of different emojis showcasing a variety of emotions: happiness, extreme sadness, shock, sleeping, eating, and giving a thumbs-up. Please maintain the main body features and colors of the character from the reference image. The overall image aspect ratio should be 16:9. I will be post-processing this image, so I would like the emoji pack to have 4 rows, with 4 emojis in each row, evenly distributed both horizontally and vertically, to facilitate easy cropping of each emoji later.';

    console.log('[Meme Generation] Calling AI provider...');
    const result = await aiProvider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        model: 'gemini-3-pro-image-preview',
        prompt,
        options: {
          image_input: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64,
              },
            },
          ],
        },
      },
    });

    console.log('[Meme Generation] AI generation completed');
    console.log('[Meme Generation] Result:', JSON.stringify(result, null, 2));

    if (!result?.taskInfo?.images?.[0]) {
      throw new Error('Failed to generate meme sticker pack');
    }

    // Get the generated image URL (already uploaded by Gemini provider)
    const generatedImageUrl = result.taskInfo.images[0].imageUrl;

    if (!generatedImageUrl) {
      throw new Error('No image URL returned from AI provider');
    }
    console.log('[Meme Generation] Generated image URL:', generatedImageUrl);

    // Consume credits
    console.log('[Meme Generation] Consuming credits...');
    await consumeCredits({
      userId: user.id,
      credits: MEME_GENERATION_COST,
      scene: 'meme-generation',
      description: 'Generate meme sticker pack',
      metadata: JSON.stringify({
        type: 'meme',
        provider,
        model: 'gemini-3-pro-image-preview',
      }),
    });
    console.log('[Meme Generation] Credits consumed successfully');

    // Save meme to database
    const newMeme: NewMeme = {
      id: getUuid(),
      userId: user.id,
      imageUrl: generatedImageUrl,
      prompt,
      provider,
      model: 'gemini-3-pro-image-preview',
      status: 'completed',
      costCredits: MEME_GENERATION_COST,
    };

    const memeRecord = await createMeme(newMeme);
    console.log('[Meme Generation] Meme saved to database:', memeRecord.id);

    return respData({
      id: memeRecord.id,
      imageUrl: memeRecord.imageUrl,
      createdAt: memeRecord.createdAt,
      costCredits: memeRecord.costCredits,
    });
  } catch (e: any) {
    console.error('[Meme Generation] Error:', e);
    console.error('[Meme Generation] Stack:', e.stack);
    return respErr(e.message || 'Failed to generate meme');
  }
}
