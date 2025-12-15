import { nanoid } from 'nanoid';
import { HttpsProxyAgent } from 'https-proxy-agent';

import {
  AIConfigs,
  AIGenerateParams,
  AIImage,
  AIMediaType,
  AIProvider,
  AITaskResult,
  AITaskStatus,
} from './types';

/**
 * Gemini configs
 */
export interface GeminiConfigs extends AIConfigs {
  apiKey: string;
}

/**
 * Gemini provider
 */
export class GeminiProvider implements AIProvider {
  // provider name
  readonly name = 'gemini';
  // provider configs
  configs: GeminiConfigs;

  // init provider
  constructor(configs: GeminiConfigs) {
    this.configs = configs;
    console.log('[GeminiProvider] Initialized with API key:', configs.apiKey);
  }

  // generate task
  async generate({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const { mediaType, model, prompt, options } = params;

    if (mediaType !== AIMediaType.IMAGE) {
      throw new Error(`mediaType not supported: ${mediaType}`);
    }

    if (!model) {
      throw new Error('model is required');
    }

    if (!prompt) {
      throw new Error('prompt is required');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.configs.apiKey}`;

    console.log('[GeminiProvider] Using API key:', this.configs.apiKey);
    console.log('[GeminiProvider] API URL:', apiUrl);

    const requestParts: any[] = [
      {
        text: prompt,
      },
    ];

    // Handle image_input - can be either URL strings or inlineData objects
    if (options && options.image_input && Array.isArray(options.image_input)) {
      for (const imageInput of options.image_input) {
        try {
          // If it's already an inlineData object, use it directly
          if (typeof imageInput === 'object' && imageInput.inlineData) {
            requestParts.push(imageInput);
          }
          // If it's a URL string, fetch and convert to base64
          else if (typeof imageInput === 'string') {
            const imageResp = await fetch(imageInput);
            if (imageResp.ok) {
              const arrayBuffer = await imageResp.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const base64Image = buffer.toString('base64');
              const mimeType =
                imageResp.headers.get('content-type') || 'image/jpeg';

              requestParts.push({
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              });
            }
          }
        } catch (e) {
          console.error('failed to process image input', imageInput, e);
        }
      }
    }

    const { image_input, ...generationConfig } = options || {};

    const payload = {
      contents: {
        role: 'user',
        parts: requestParts,
      },
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        ...generationConfig,
      },
    };

    console.log('[Gemini] API URL:', apiUrl);
    console.log('[Gemini] Request payload:', JSON.stringify(payload, null, 2));

    // Configure proxy if available
    const { envConfigs } = await import('@/config');
    const proxyUrl = envConfigs.https_proxy || envConfigs.http_proxy;
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    // Add proxy agent if proxy is configured
    if (proxyUrl) {
      console.log('[Gemini] Using proxy:', proxyUrl);
      const proxyAgent = new HttpsProxyAgent(proxyUrl);
      // @ts-ignore - undici fetch accepts agent option
      fetchOptions.dispatcher = proxyAgent;
    }

    let resp;
    try {
      resp = await fetch(apiUrl, fetchOptions);
    } catch (fetchError: any) {
      console.error('[Gemini] Fetch error:', fetchError);
      throw new Error(
        `Failed to connect to Gemini API: ${fetchError.message}. Please check your network connection and API key.${proxyUrl ? ' Proxy: ' + proxyUrl : ''}`
      );
    }

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[Gemini] API error response:', errorText);
      throw new Error(
        `request failed with status: ${resp.status}, body: ${errorText}`
      );
    }

    const data = await resp.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('no candidates returned');
    }

    const taskId = nanoid(); // Gemini API doesn't return a task ID for synchronous generation
    const candidate = data.candidates[0];
    const parts = candidate.content?.parts;

    if (!parts || parts.length === 0) {
      throw new Error('no parts returned');
    }

    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart) {
      throw new Error('no image part returned');
    }

    const mimeType = imagePart.inlineData.mimeType;
    const base64Data = imagePart.inlineData.data;

    // upload to storage
    const { getStorageService } = await import('@/shared/services/storage');
    const storageService = await getStorageService();
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = mimeType.split('/')[1] || 'png';
    const filename = `${nanoid()}.${ext}`;
    const key = `ai/gemini/${filename}`;

    const uploadResult = await storageService.uploadFile({
      body: buffer,
      key,
      contentType: mimeType,
    });

    if (!uploadResult || !uploadResult.url) {
      throw new Error('upload image failed');
    }

    // replace base64 data with url to save db space
    if (imagePart.inlineData) {
      imagePart.inlineData.data = uploadResult.url;
      // Ensure the original data object is updated
      const partIndex = parts.findIndex((p: any) => p === imagePart);
      if (partIndex !== -1 && data.candidates?.[0]?.content?.parts) {
        // unset image base64 data
        data.candidates[0].content.parts[partIndex].inlineData.data =
          uploadResult.url;
        // unset thoughtSignature
        data.candidates[0].content.parts[partIndex].thoughtSignature = ''
      }
    }

    const image: AIImage = {
      id: nanoid(),
      createTime: new Date(),
      imageType: mimeType,
      imageUrl: uploadResult.url,
    };

    return {
      taskStatus: AITaskStatus.SUCCESS,
      taskId: taskId,
      taskInfo: {
        images: [image],
        status: 'success',
        createTime: new Date(),
      },
      taskResult: data,
    };
  }
}
