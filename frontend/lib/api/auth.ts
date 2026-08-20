import type { User } from '@/types';
import { mockUsers } from '@/lib/mock/data';
import { delay } from './client';

// Auth is mocked for this frontend-only prototype. The real Go backend will
// issue JWT sessions; here we return a fixed demo user.

const DEMO_USER: User = mockUsers.find((u) => u.role === 'fisher')!;

export async function getCurrentUser(): Promise<User> {
  return delay({ ...DEMO_USER });
}

export async function signOut(): Promise<void> {
  return delay(undefined, 200);
}
