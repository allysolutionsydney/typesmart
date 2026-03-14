import dynamic from "next/dynamic";

// Disable SSR for the landing page to prevent hydration issues with Clerk
const TypeSmartLanding = dynamic(
  () => import("@/components/TypeSmartLanding"),
  { ssr: false }
);

export default function Home() {
  return <TypeSmartLanding />;
}
