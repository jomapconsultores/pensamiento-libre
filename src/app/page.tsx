import { Hero } from '@/components/Hero';
import { MissionVision } from '@/components/MissionVision';
import { Programs } from '@/components/Programs';
import { Testimonials } from '@/components/Testimonials';
import { DonateCTA } from '@/components/DonateCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <MissionVision />
      <Programs />
      <Testimonials />
      <DonateCTA />
    </>
  );
}
