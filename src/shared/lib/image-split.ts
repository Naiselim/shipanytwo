import sharp from 'sharp';

export interface SplitImageResult {
  images: {
    index: number;
    row: number;
    col: number;
    dataUrl: string;
  }[];
}

/**
 * Split an image into a grid of smaller images
 * @param base64Data - Base64 encoded image data (without data URL prefix)
 * @param mimeType - Image MIME type (e.g., 'image/png')
 * @param rows - Number of rows (default: 4)
 * @param cols - Number of columns (default: 4)
 * @returns Array of split images as data URLs
 */
export async function splitImage(
  base64Data: string,
  mimeType: string,
  rows: number = 4,
  cols: number = 4
): Promise<SplitImageResult> {
  try {
    console.log('[Image Split] Starting image split process...');
    console.log('[Image Split] Grid size:', rows, 'x', cols);

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    console.log('[Image Split] Image buffer size:', imageBuffer.length, 'bytes');

    // Get image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      throw new Error('Could not determine image dimensions');
    }

    console.log('[Image Split] Original image size:', width, 'x', height);

    // Calculate dimensions for each piece
    const pieceWidth = Math.floor(width / cols);
    const pieceHeight = Math.floor(height / rows);

    console.log('[Image Split] Piece size:', pieceWidth, 'x', pieceHeight);

    // Split the image
    const splitImages: SplitImageResult['images'] = [];
    let index = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const left = col * pieceWidth;
        const top = row * pieceHeight;

        console.log(`[Image Split] Processing piece ${index + 1}/${rows * cols} (row: ${row}, col: ${col})`);

        // Extract the piece
        const pieceBuffer = await sharp(imageBuffer)
          .extract({
            left,
            top,
            width: pieceWidth,
            height: pieceHeight,
          })
          .toBuffer();

        // Convert to base64 data URL
        const pieceBase64 = pieceBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${pieceBase64}`;

        splitImages.push({
          index,
          row,
          col,
          dataUrl,
        });

        index++;
      }
    }

    console.log('[Image Split] Successfully split image into', splitImages.length, 'pieces');
    console.log('[Image Split] Average piece size:', Math.round(splitImages.reduce((acc, img) => acc + img.dataUrl.length, 0) / splitImages.length / 1024), 'KB');

    return {
      images: splitImages,
    };
  } catch (error) {
    console.error('[Image Split] Error splitting image:', error);
    throw new Error(`Failed to split image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate total storage size for split images
 */
export function calculateSplitImageSize(splitResult: SplitImageResult): number {
  return splitResult.images.reduce((total, img) => total + img.dataUrl.length, 0);
}
