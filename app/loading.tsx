// Habang nagbubukas ang isang pahina (Next.js loading boundary): ang PAN seal
// na may umiikot na gintong singsing, sa gitna ng cream na pahina.
import PanLoader from "@/components/PanLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <PanLoader />
    </div>
  );
}
