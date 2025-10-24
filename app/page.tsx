import { CategoryMenu, Hero, Incentives, IntroducingSection, Newsletter, ProductsSection } from "@/components";
import PromoBanner from "@/components/PromoBanner";

export default function Home() {
  return (
    <>
    <Hero />
     <ProductsSection />
   
    <CategoryMenu />
    <IntroducingSection />
    <PromoBanner/>
    </>
  );
}
