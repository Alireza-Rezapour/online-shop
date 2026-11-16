import Title from "./components/Title";
import CategoryShowcase from "./components/CategoryShowcase";
import {
  BestSellingSection,
  NewestSection,
} from "./components/HomeProductSections";
import { ShopTheLookSection } from "./components/ShopLook/shop-the-look-section";
import { Suspense } from "react";
import { Hero } from "./components/Hero/hero";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="sm:mt-10">
        <Title title="دسته بندی ها" />
        <CategoryShowcase />
      </div>
      <div className="sm:my-15">
        <Title title="جدیدترین محصولات" />
        <NewestSection className="container mx-auto px-4 py-8" />;
      </div>
      <div className="sm:my-6">{/* <CollectionsSwiper /> */}</div>
      <div className="sm:my-15">
        <Title title="پرفروش‌ترین محصولات" />
        <BestSellingSection className="container mx-auto px-4 py-8" />
      </div>
      <div className="sm:my-10">
        <Title title="استایلت رو بخر" />
        <Suspense fallback={null}>
          <ShopTheLookSection />
        </Suspense>
      </div>
    </>
  );
}
