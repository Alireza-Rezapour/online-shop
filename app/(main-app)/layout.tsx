import Footer from "./components/footer/page";
import MobileMenu from "./components/navbar/mobile/MobileMenu";
import Navbar from "./components/navbar/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* room for the fixed bottom bar on mobile / tablet */}
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
        <Footer />
      </div>
      <MobileMenu />
    </>
  );
}
