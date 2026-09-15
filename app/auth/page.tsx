import PremiumOnboarding from '@/components/auth/PremiumOnboarding';

export const metadata = {
  title: 'Identity Establishment | Online Bar',
  description: 'Premium onboarding for Nairobi\'s elite drinks grid.',
};

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-primary/20">
      <PremiumOnboarding />
    </main>
  );
}
