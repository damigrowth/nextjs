import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  CameraIcon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const verificationsData = [
  {
    id: 1,
    user: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/avatars/john.jpg',
    type: 'Identity Verification',
    status: 'Pending',
    submittedDate: '2024-01-18',
    documents: ['ID Card', 'Selfie Photo'],
    notes: 'All documents submitted correctly',
    priority: 'Normal',
  },
  {
    id: 2,
    user: 'Maria Kostas',
    email: 'maria.kostas@example.com',
    avatar: '/avatars/maria.jpg',
    type: 'Professional Verification',
    status: 'Approved',
    submittedDate: '2024-01-15',
    documents: ['Portfolio', 'Certificates', 'ID Card'],
    notes: 'Excellent portfolio and valid certifications',
    priority: 'Normal',
  },
  {
    id: 3,
    user: 'Alex Papadopoulos',
    email: 'alex.papadopoulos@example.com',
    avatar: '/avatars/alex.jpg',
    type: 'Address Verification',
    status: 'Rejected',
    submittedDate: '2024-01-12',
    documents: ['Utility Bill'],
    notes: 'Document quality too poor to verify',
    priority: 'Normal',
  },
  {
    id: 4,
    user: 'Sofia Dimitriou',
    email: 'sofia.dimitriou@example.com',
    avatar: '/avatars/sofia.jpg',
    type: 'Identity Verification',
    status: 'Under Review',
    submittedDate: '2024-01-17',
    documents: ['Passport', 'Selfie Photo'],
    notes: 'High priority verification request',
    priority: 'High',
  },
];

export default function VerificationsPage() {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Verifications</h1>
            <p className='text-muted-foreground'>
              Review and manage user verification requests
            </p>
          </div>
          <Button>
            <CheckCircleIcon className='mr-2 h-4 w-4' />
            Review Queue
          </Button>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>23</div>
              <p className='text-xs text-muted-foreground'>Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Approved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>12</div>
              <p className='text-xs text-muted-foreground'>+5 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>1,247</div>
              <p className='text-xs text-muted-foreground'>85% success rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg Review Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>4.2h</div>
              <p className='text-xs text-muted-foreground'>Processing time</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <Tabs defaultValue='pending' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='pending'>Pending</TabsTrigger>
              <TabsTrigger value='under-review'>Under Review</TabsTrigger>
              <TabsTrigger value='approved'>Approved</TabsTrigger>
              <TabsTrigger value='rejected'>Rejected</TabsTrigger>
            </TabsList>

            <div className='flex items-center space-x-2'>
              <div className='relative'>
                <SearchIcon className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search verifications...'
                  className='pl-8 w-64'
                />
              </div>
              <Select>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='identity'>Identity</SelectItem>
                  <SelectItem value='professional'>Professional</SelectItem>
                  <SelectItem value='address'>Address</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value='pending' className='space-y-4'>
            <div className='space-y-4'>
              {verificationsData
                .filter((verification) => verification.status === 'Pending')
                .map((verification) => (
                  <Card key={verification.id} className='border-yellow-200'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start space-x-4'>
                            <Avatar className='h-12 w-12'>
                              <AvatarImage
                                src={verification.avatar}
                                alt={verification.user}
                              />
                              <AvatarFallback>
                                {verification.user
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold text-lg'>
                                  {verification.user}
                                </h3>
                                <Badge
                                  variant='secondary'
                                  className='bg-yellow-100 text-yellow-800'
                                >
                                  {verification.status}
                                </Badge>
                                {verification.priority === 'High' && (
                                  <Badge variant='destructive'>
                                    High Priority
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground mb-2'>
                                {verification.email}
                              </p>
                              <div className='flex items-center gap-2 mb-2'>
                                <Badge variant='outline'>
                                  {verification.type}
                                </Badge>
                                <span className='text-sm text-muted-foreground'>
                                  Submitted {verification.submittedDate}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 mb-2'>
                                <FileTextIcon className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm text-muted-foreground'>
                                  {verification.documents.join(', ')}
                                </span>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {verification.notes}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 ml-4'>
                          <Button variant='outline' size='sm'>
                            <CameraIcon className='mr-1 h-3 w-3' />
                            View Documents
                          </Button>
                          <Button variant='destructive' size='sm'>
                            <XCircleIcon className='mr-1 h-3 w-3' />
                            Reject
                          </Button>
                          <Button
                            size='sm'
                            className='bg-green-600 hover:bg-green-700'
                          >
                            <CheckCircleIcon className='mr-1 h-3 w-3' />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='under-review' className='space-y-4'>
            <div className='space-y-4'>
              {verificationsData
                .filter(
                  (verification) => verification.status === 'Under Review',
                )
                .map((verification) => (
                  <Card key={verification.id} className='border-blue-200'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start space-x-4'>
                            <Avatar className='h-12 w-12'>
                              <AvatarImage
                                src={verification.avatar}
                                alt={verification.user}
                              />
                              <AvatarFallback>
                                {verification.user
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold text-lg'>
                                  {verification.user}
                                </h3>
                                <Badge
                                  variant='default'
                                  className='bg-blue-100 text-blue-800'
                                >
                                  <ClockIcon className='mr-1 h-3 w-3' />
                                  {verification.status}
                                </Badge>
                                {verification.priority === 'High' && (
                                  <Badge variant='destructive'>
                                    High Priority
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground mb-2'>
                                {verification.email}
                              </p>
                              <div className='flex items-center gap-2 mb-2'>
                                <Badge variant='outline'>
                                  {verification.type}
                                </Badge>
                                <span className='text-sm text-muted-foreground'>
                                  Submitted {verification.submittedDate}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 mb-2'>
                                <FileTextIcon className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm text-muted-foreground'>
                                  {verification.documents.join(', ')}
                                </span>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {verification.notes}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 ml-4'>
                          <Button variant='outline' size='sm'>
                            <CameraIcon className='mr-1 h-3 w-3' />
                            Continue Review
                          </Button>
                          <Button variant='outline' size='sm'>
                            Request More Info
                          </Button>
                          <Button
                            size='sm'
                            className='bg-green-600 hover:bg-green-700'
                          >
                            <CheckCircleIcon className='mr-1 h-3 w-3' />
                            Complete Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='approved' className='space-y-4'>
            <div className='space-y-4'>
              {verificationsData
                .filter((verification) => verification.status === 'Approved')
                .map((verification) => (
                  <Card key={verification.id} className='border-green-200'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start space-x-4'>
                            <Avatar className='h-12 w-12'>
                              <AvatarImage
                                src={verification.avatar}
                                alt={verification.user}
                              />
                              <AvatarFallback>
                                {verification.user
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold text-lg'>
                                  {verification.user}
                                </h3>
                                <Badge
                                  variant='default'
                                  className='bg-green-100 text-green-800'
                                >
                                  <CheckCircleIcon className='mr-1 h-3 w-3' />
                                  {verification.status}
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground mb-2'>
                                {verification.email}
                              </p>
                              <div className='flex items-center gap-2 mb-2'>
                                <Badge variant='outline'>
                                  {verification.type}
                                </Badge>
                                <span className='text-sm text-muted-foreground'>
                                  Approved {verification.submittedDate}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 mb-2'>
                                <FileTextIcon className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm text-muted-foreground'>
                                  {verification.documents.join(', ')}
                                </span>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {verification.notes}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 ml-4'>
                          <Button variant='outline' size='sm'>
                            <CameraIcon className='mr-1 h-3 w-3' />
                            View Documents
                          </Button>
                          <Button variant='outline' size='sm'>
                            Download Certificate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='rejected' className='space-y-4'>
            <div className='space-y-4'>
              {verificationsData
                .filter((verification) => verification.status === 'Rejected')
                .map((verification) => (
                  <Card key={verification.id} className='border-red-200'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start space-x-4'>
                            <Avatar className='h-12 w-12'>
                              <AvatarImage
                                src={verification.avatar}
                                alt={verification.user}
                              />
                              <AvatarFallback>
                                {verification.user
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold text-lg'>
                                  {verification.user}
                                </h3>
                                <Badge variant='destructive'>
                                  <XCircleIcon className='mr-1 h-3 w-3' />
                                  {verification.status}
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground mb-2'>
                                {verification.email}
                              </p>
                              <div className='flex items-center gap-2 mb-2'>
                                <Badge variant='outline'>
                                  {verification.type}
                                </Badge>
                                <span className='text-sm text-muted-foreground'>
                                  Rejected {verification.submittedDate}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 mb-2'>
                                <FileTextIcon className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm text-muted-foreground'>
                                  {verification.documents.join(', ')}
                                </span>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Rejection reason: {verification.notes}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 ml-4'>
                          <Button variant='outline' size='sm'>
                            <CameraIcon className='mr-1 h-3 w-3' />
                            View Documents
                          </Button>
                          <Button variant='outline' size='sm'>
                            Send Feedback
                          </Button>
                          <Button
                            size='sm'
                            className='bg-blue-600 hover:bg-blue-700'
                          >
                            Allow Resubmission
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
