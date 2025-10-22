import { Head } from '@inertiajs/react';
import {
  Header,
  HeroSection,
  FeatureSection,
  TestimonialsSection,
  PricingSection,
  Footer
} from '@/components/landing';

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col">
      <Head title="Project Management" />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
