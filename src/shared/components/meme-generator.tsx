'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Loader2, Download, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface Meme {
  id: string;
  imageUrl: string;
  createdAt: string;
  costCredits: number;
}

interface MemeGeneratorProps {
  userId?: string;
  remainingCredits?: number;
  onCreditsUpdate?: () => void;
}

export function MemeGenerator({
  userId,
  remainingCredits = 0,
  onCreditsUpdate,
}: MemeGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<Meme | null>(null);

  const fetchMemes = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/user/memes?limit=10');
      const data = await response.json();

      if (response.ok && data.data) {
        setMemes(data.data.memes || []);
      }
    } catch (error) {
      console.error('Failed to fetch memes:', error);
    }
  }, [userId]);

  // Load memes on mount and when userId changes
  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateMeme = useCallback(async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    if (!userId) {
      toast.error('Please sign in to generate memes');
      return;
    }

    if (remainingCredits < 2) {
      toast.error('Insufficient credits. You need at least 2 credits.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('provider', 'gemini');

      const response = await fetch('/api/ai/meme/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate meme');
      }

      toast.success('Meme generated successfully!');
      setGeneratedMeme(data.data);
      setShowResult(true);
      setSelectedFile(null);
      setPreview(null);

      // Update credits
      if (onCreditsUpdate) {
        onCreditsUpdate();
      }

      // Refresh meme list
      fetchMemes();
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, userId, remainingCredits, onCreditsUpdate, fetchMemes]);

  const handleDeleteMeme = useCallback(
    async (memeId: string) => {
      try {
        const response = await fetch(`/api/user/memes/${memeId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete meme');
        }

        toast.success('Meme deleted successfully');
        fetchMemes();
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete meme'
        );
      }
    },
    [fetchMemes]
  );

  if (!userId) {
    return (
      <Card className="p-8 text-center">
        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Sign in to Generate Memes</h3>
        <p className="text-sm text-muted-foreground">
          Please sign in to start generating custom meme sticker packs
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generator Section */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Generate Meme Sticker Pack</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Upload an image to generate a 4x4 grid of cute emoji variations (costs 2
          credits)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          {preview && (
            <div className="relative rounded-lg border p-4">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto max-h-64 rounded-md object-contain"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={loading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? 'Change Image' : 'Select Image'}
            </Button>

            <Button
              onClick={handleGenerateMeme}
              disabled={!selectedFile || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Meme (2 credits)'
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Credits available: <span className="font-semibold">{remainingCredits ?? 0}</span>
          </p>
        </div>
      </Card>

      {/* Generated Meme Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Meme Sticker Pack</DialogTitle>
            <DialogDescription>
              Your custom emoji pack has been generated! Right-click to save or
              download below.
            </DialogDescription>
          </DialogHeader>
          {generatedMeme && (
            <div className="space-y-4">
              <img
                src={generatedMeme.imageUrl}
                alt="Generated meme"
                className="w-full rounded-lg"
              />
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a
                    href={generatedMeme.imageUrl}
                    download={`meme-${generatedMeme.id}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meme History */}
      {memes.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Your Recent Memes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {memes.map((meme) => (
              <div key={meme.id} className="group relative rounded-lg border p-2">
                <img
                  src={meme.imageUrl}
                  alt="Meme"
                  className="w-full rounded-md"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {new Date(meme.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                    >
                      <a
                        href={meme.imageUrl}
                        download={`meme-${meme.id}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteMeme(meme.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
