import { Navbar, Footer } from '@/components/layout';
import { Hero, Features, FeaturedMusic, Pricing, CTA } from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <FeaturedMusic />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
