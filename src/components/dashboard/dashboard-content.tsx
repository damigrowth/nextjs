import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  BarChart3,
  MessageSquare,
  Settings,
  Plus,
  Users,
} from 'lucide-react';

import { getCurrentUser, isProfessional } from '@/actions/auth/server';
import { NextLink } from '@/components';

interface DashboardData {
  services: any;
  reviews: any;
  popularServices: any;
  totalServices: number;
  totalReviews: number;
}

export default async function DashboardContent() {
  const userResult = await getCurrentUser();
  const professionalResult = await isProfessional();

  const user = userResult.success ? userResult.data.user : null;
  const profile = userResult.success ? userResult.data.profile : null;
  const userHasAccess = professionalResult.success
    ? professionalResult.data
    : false;

  const userId = user?.id;
  const displayName =
    user?.displayName || user?.name || profile?.firstName || 'User';

  // Temporary mock data while migrating from Strapi
  const data: DashboardData = {
    services: null,
    reviews: null,
    popularServices: null,
    totalServices: 0, // TODO: Implement services count from new data structure
    totalReviews: 0, // TODO: Implement reviews count from new data structure
  };

  if (!userHasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Καλώς ήρθες, {displayName}!</CardTitle>
          <CardDescription>
            Μπορείς να συμπληρώσεις τα στοιχεία σου και να εξερευνήσεις την
            πλατφόρμα.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Μπορείς να συμπληρώσεις τα στοιχεία σου στην{' '}
            <NextLink
              href='/dashboard/profile/account'
              className='font-semibold text-primary hover:underline'
            >
              Διαχείριση Προφίλ
            </NextLink>
            . Ακόμα, μπορείς να αποθηκεύσεις τις Αγαπημένες σου υπηρεσίες και τα
            προφίλ. Εάν έχεις έρθει σε επικοινωνία με κάποιον επαγγελματία, μη
            διστάσεις να υποβάλεις μια αξιολόγηση. Θα βοηθήσεις έτσι, και άλλους
            χρήστες να βρουν αυτό που ψάχνουν!
          </p>
          <div className='flex flex-wrap gap-3 pt-4'>
            <Button asChild>
              <NextLink href='/ipiresies'>
                Όλες οι Υπηρεσίες
                <ArrowRight className='ml-2 h-4 w-4' />
              </NextLink>
            </Button>
            <Button variant='outline' asChild>
              <NextLink href='/dir'>
                Επαγγελματικός Κατάλογος
                <ArrowRight className='ml-2 h-4 w-4' />
              </NextLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Πίνακας Ελέγχου</h1>
        <p className='text-muted-foreground'>
          Καλώς ήρθατε! Βελτιώστε την εικόνα σας, προσθέστε πληροφορίες στο
          επαγγελματικό προφίλ σας και προσθέστε όλες τις υπηρεσίες σας για να
          σας εντοπίσουν οι χρήστες της πλατφόρμας!
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Υπηρεσίες</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.totalServices}</div>
            <Badge variant='secondary' className='mt-2'>
              Ενεργές υπηρεσίες
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Αξιολογήσεις</CardTitle>
            <MessageSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.totalReviews}</div>
            <Badge variant='secondary' className='mt-2'>
              Συνολικές αξιολογήσεις
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Συντομεύσεις
            </CardTitle>
            <CardDescription>
              Γρήγορη πρόσβαση στις κύριες λειτουργίες
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button variant='outline' className='w-full justify-start' asChild>
              <NextLink href='/dashboard/profile/account'>
                <Users className='mr-2 h-4 w-4' />
                Διαχείριση Προφίλ
                <ArrowRight className='ml-auto h-4 w-4' />
              </NextLink>
            </Button>
            <Button variant='outline' className='w-full justify-start' asChild>
              <NextLink href='/dashboard/services/create'>
                <Plus className='mr-2 h-4 w-4' />
                Προσθήκη Υπηρεσίας
                <ArrowRight className='ml-auto h-4 w-4' />
              </NextLink>
            </Button>
            <Button variant='outline' className='w-full justify-start' asChild>
              <NextLink href='/dashboard/services'>
                <BarChart3 className='mr-2 h-4 w-4' />
                Διαχείριση Υπηρεσιών
                <ArrowRight className='ml-auto h-4 w-4' />
              </NextLink>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Τελευταία Μηνύματα
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-sm text-muted-foreground text-center py-8'>
              Δεν υπάρχουν μηνύματα μέχρι τώρα. Βελτιώστε την εμφάνιση του
              επαγγελματικού προφίλ και των υπηρεσιών σας για να σας ξεχωρίσουν
              περισσότεροι χρήστες!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
