import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import Bestsellers from "@/components/home/Bestsellers";
import BrandStory from "@/components/home/BrandStory";
import WhyKoolLifestyle from "@/components/home/WhyKoolLifestyle";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedCollections />
      <Bestsellers />
      <BrandStory />
      <WhyKoolLifestyle />
      <Testimonials />
      <Newsletter />
    </Layout>
  );
};

export default Index;
