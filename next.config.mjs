/** @type {import('next').NextConfig} */
const nextConfig = {
  // next/image optimization ON — awtomatikong nagre-resize at nagse-serve ng
  // WebP/AVIF ang Vercel, kaya hindi na dina-download ng telepono ang buong
  // multi-MB na orihinal na larawan (dating sanhi ng mabagal/jank na scroll).
  images: {
    // Mga larawang naka-host sa Supabase Storage (uploads mula sa IMS admin).
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
};

export default nextConfig;
