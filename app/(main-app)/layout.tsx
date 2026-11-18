import { Suspense } from "react";
import Footer from "./components/footer/page";
import MobileMenu from "./components/navbar/mobile/MobileMenu";
import Navbar from "./components/navbar/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<header className="h-16 border-b" />}>
        <Navbar />
      </Suspense>
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
        <Footer />
      </div>
      <Suspense fallback={null}>
        <MobileMenu />
      </Suspense>
    </>
  );
}
