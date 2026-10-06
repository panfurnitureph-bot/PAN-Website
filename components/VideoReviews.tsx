"use client";

// "Sit back and press play" — video review cards na may totoong
// HTML5 video player (play/pause, mute, progress), poster thumbnails.

import { useRef, useState } from "react";
import Marquee from "@/components/home/Marquee";
import type { HomepageContent } from "@/lib/products";

function VideoCard({
  video,
  poster,
  name,
  role,
}: {
  video: string;
  poster: string;
  name: string;
  role: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Ang isang slot ay pwedeng larawan O video. Kung larawan, ipapakita ito
  // bilang still na larawan — walang player.
  const isImage = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(video);

  function toggle() {
    const v = ref.current;
    if (!v || !video) return; // walang source — huwag mag-play (iwas NotSupportedError)
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    // Lapad = ang slot ng carousel (2026-10-07): dati 70vw / 300px na mas malapad
    // sa slot kaya nagpapatong ang magkatabing card sa telepono.
    <div className="group w-full">
      <div className="relative aspect-[9/14] bg-sand overflow-hidden rounded-[20px] shadow-[0_0_0_1px_#E4DACA,0_22px_38px_-28px_rgba(62,50,32,.6)] transition-transform duration-300 group-hover:-translate-y-1">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video} alt={name || "Customer photo"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <>
            <video
              ref={ref}
              src={video}
              poster={poster}
              muted={muted}
              playsInline
              loop
              // Huwag i-download ang video hangga't hindi pinipindot ang play —
              // ang poster ang nakikita. May 32MB na video review dati na
              // bumabagal sa buong page load ng mobile.
              preload="none"
              className="w-full h-full object-cover"
              onClick={toggle}
            />
            {/* Controls */}
            <div className="absolute z-[2] top-3 right-3 flex items-center gap-2">
              <button
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-ink flex items-center justify-center shadow-[0_8px_16px_-10px_rgba(0,0,0,.6)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>{playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
              </button>
              <button
                onClick={() => {
                  setMuted(!muted);
                  if (ref.current) ref.current.muted = !muted;
                }}
                aria-label={muted ? "Unmute" : "Mute"}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-ink flex items-center justify-center shadow-[0_8px_16px_-10px_rgba(0,0,0,.6)]"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />{muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />}</svg>
              </button>
            </div>
          </>
        )}
        {/* Pangalan at role nakapatong sa ibaba ng card (premium, 2026-10-07) — parehong teksto. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] px-3 pb-3 sm:px-4 sm:pb-4 pt-16 bg-[linear-gradient(180deg,transparent,rgba(26,20,12,.82))] text-white">
          <p className="font-cormorant font-semibold text-[13.5px] sm:text-[15.5px] leading-tight">{name}</p>
          <p className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-gold mt-1">{role}</p>
        </div>
      </div>
    </div>
  );
}

// Galing sa homepage (server) — doon nabasa ang Supabase content.
export default function VideoReviews({
  videoReviews,
}: {
  videoReviews: HomepageContent["videoReviews"];
}) {
  const { eyebrow, title, items } = videoReviews;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-14">
      {/* RAIL (2026-09-04): parehong carousel engine ng buong homepage */}
      <Marquee eyebrow={eyebrow} title={title} n={[4, 3, 2, 2]}>
        {items
          .filter((v) => v.video) // laktawan ang mga walang video file
          .map((v, i) => (
            <VideoCard key={v.name + i} {...v} />
          ))}
      </Marquee>
    </section>
  );
}
