'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

interface Meme {
  id: string;
  imageUrl: string;
  createdAt: string;
  costCredits: number;
}

interface MemeGalleryProps {
  userId?: string;
  limit?: number;
}

export function MemeGallery({ userId, limit = 20 }: MemeGalleryProps) {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMemes = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/user/memes?limit=${limit}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setMemes(data.data.memes || []);
      }
    } catch (error) {
      console.error('Failed to fetch memes:', error);
      toast.error('Failed to load memes');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);

  const handleDeleteMeme = async (memeId: string) => {
    try {
      setDeletingId(memeId);
      const response = await fetch(`/api/user/memes/${memeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete meme');
      }

      toast.success('Meme deleted successfully');
      setMemes((prev) => prev.filter((m) => m.id !== memeId));
    } catch (error) {
      console.error('Failed to delete meme:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete meme');
    } finally {
      setDeletingId(null);
    }
  };

  if (!userId) {
    return null;
  }

  if (loading) {
    return (
      <section className="container py-20">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading your meme collection...</p>
          </div>
        </Card>
      </section>
    );
  }

  if (memes.length === 0) {
    return null;
  }

  return (
    <section className="container py-20">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Your Meme Collection</h2>
        <p className="text-muted-foreground">
          All your generated emoji sticker packs in one place
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {memes.map((meme) => (
            <div
              key={meme.id}
              className="group relative rounded-lg border overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="aspect-video relative bg-muted">
                <img
                  src={meme.imageUrl}
                  alt="Meme sticker pack"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(meme.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cost: {meme.costCredits} credits
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                      title="Download"
                    >
                      <a
                        href={meme.imageUrl}
                        download={`meme-${meme.id}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteMeme(meme.id)}
                      disabled={deletingId === meme.id}
                      title="Delete"
                    >
                      {deletingId === meme.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {memes.length >= limit && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {memes.length} most recent memes
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
