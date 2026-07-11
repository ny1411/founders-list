'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { buttonVariants } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';

export function HeaderAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="w-20 h-8 rounded-md bg-secondary animate-pulse" />;
  }

  if (user) {
    return (
      <Link href="/profile" className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2" })}>
        <User className="w-4 h-4" />
        Profile
      </Link>
    );
  }

  return (
    <Link href="/login" className={buttonVariants({ variant: "default", size: "sm", className: "gap-2" })}>
      <LogIn className="w-4 h-4" />
      Login
    </Link>
  );
}
