import LandingPage from './(landing)/page';
import LandingLayout from './(landing)/layout';

export default function Home() {
  return (
    <LandingLayout>
      <LandingPage />
    </LandingLayout>
  );
}
