import { Suspense } from 'react';
import AuthCallbackWrapper from './AuthCallbackWrapper';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-300">جارٍ التحقق...</div>}>
      <AuthCallbackWrapper />
    </Suspense>
  );
}
