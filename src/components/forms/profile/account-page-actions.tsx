'use client';

import { useState } from 'react';
import { ChangePasswordForm } from '@/components';
import { DeleteAccountForm } from '@/components';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Key, Trash2 } from 'lucide-react';
import { AuthUser } from '@/lib/types/auth';

interface AccountPageActionsProps {
  user: AuthUser | null;
}

export default function AccountPageActions({ user }: AccountPageActionsProps) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Ενέργειες Λογαριασμού</h2>

      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Change Password Button */}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className='flex items-center gap-2'>
              <Key className='h-4 w-4' />
              Αλλαγή Κωδικού
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <ChangePasswordForm
              onSuccess={() => setChangePasswordOpen(false)}
              onCancel={() => setChangePasswordOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Account Button */}
        <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
          <DialogTrigger asChild>
            <Button variant='destructive' className='flex items-center gap-2'>
              <Trash2 className='h-4 w-4' />
              Διαγραφή Λογαριασμού
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <DeleteAccountForm
              user={user}
              onSuccess={() => setDeleteAccountOpen(false)}
              onCancel={() => setDeleteAccountOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
