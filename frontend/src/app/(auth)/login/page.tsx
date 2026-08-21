import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const params = await searchParams;
  if (params?.pending) {
    redirect('/?auth=login&pending=true');
  }
  redirect('/?auth=login');
}

