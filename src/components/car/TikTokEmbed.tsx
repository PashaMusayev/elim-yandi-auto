import { useState } from 'react';
import { Play } from 'lucide-react';
import { TikTokIcon } from '@/components/ui/BrandIcons';

/** tiktok.com/@user/video/123 → 123. Qısa linklər (vm.tiktok.com) üçün null. */
export function tiktokVideoId(url: string): string | null {
  return url.match(/\/video\/(\d+)/)?.[1] ?? null;
}

/** Video yalnız toxunanda yüklənir — TikTok player ağırdır. */
export function TikTokEmbed({ url }: { url: string }) {
  const [play, setPlay] = useState(false);
  const id = tiktokVideoId(url);

  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-3 rounded-2xl bg-coal p-4 ring-1 ring-white/5 hover:ring-ember/40"
      >
        <span className="grid size-12 place-items-center rounded-xl bg-black">
          <TikTokIcon className="size-6" />
        </span>
        <span>
          <span className="block font-bold">Bu maşının videosu TikTok-da</span>
          <span className="text-sm text-mute">Bax, bəyən, dostuna göndər 😄</span>
        </span>
      </a>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <div className="relative aspect-[9/16]">
        {play ? (
          <iframe
            title="TikTok videosu"
            src={`https://www.tiktok.com/player/v1/${id}?autoplay=1&rel=0`}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlay(true)}
            className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle,#2a1208,#000)]"
            aria-label="TikTok videosunu oynat"
          >
            <span className="flex flex-col items-center gap-3">
              <span className="grid size-16 place-items-center rounded-full bg-fire">
                <Play className="size-7 fill-white" />
              </span>
              <span className="flex items-center gap-1.5 text-sm font-bold">
                <TikTokIcon className="size-4" /> Videoya bax
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
