'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthToken } from '@/context/AuthContext';

export default function AutoLoginPage() {
  const { setAuthToken, setUsername } = useAuthToken();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const loginAndSetToken = async () => {
      try {
        const param = {
          tokenNo: '',
          data: {
            orgId: Number(params.orgId),
            userId: Number(params.userId),
          },
        };
        const userData = await fetch('/api/auth/login-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(param),
        }).then(res => res.json());

        if (userData.success) {
          setAuthToken(userData.data.tokenNo);
          setUsername(userData.data.userName);
          router.push(`/ssd-estimate/${params.patientCode}/${params.patientOpdCode}`);
        } else {
          router.push('/');
        }
      } catch (err) {
        router.push('/');
      }
    };

    loginAndSetToken();
  }, [params, setAuthToken, router, setUsername]);

  return <div>Logging in...</div>;
}