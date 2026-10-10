import { FeatureSection, Footer, Header, HeroSection, PricingSection, TestimonialsSection } from '@/components/landing';
import { Head } from '@inertiajs/react';
import '../../css/landing.css';

export default function Welcome() {
    return (
        <div className="landing-page bg-background text-foreground flex min-h-screen flex-col font-sans">
            <Head title="Project Management" />
            <a href="#main-content" className="bg-background sr-only z-50 p-4 focus:not-sr-only focus:fixed">
                Skip to content
            </a>
            <Header />
            <main id="main-content" className="flex-1">
                <HeroSection />
                <FeatureSection />
                <TestimonialsSection />
                <PricingSection />
            </main>
            <Footer />
        </div>
    );
}
