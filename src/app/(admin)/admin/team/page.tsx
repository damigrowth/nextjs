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
import {
  SearchIcon,
  UserPlusIcon,
  EditIcon,
  TrashIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
} from 'lucide-react';
import UserAvatar from '@/components/shared/user-avatar';

export const dynamic = 'force-dynamic';

const teamData = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@doulitsa.com',
    phone: '+30 210 123 4567',
    avatar: '/avatars/alex-admin.jpg',
    role: 'Super Admin',
    department: 'Management',
    status: 'Active',
    lastLogin: '2024-01-18 14:30',
    joinDate: '2023-06-15',
    permissions: ['Full Access', 'User Management', 'System Settings'],
    location: 'Athens, Greece',
  },
  {
    id: 2,
    name: 'Maria Papadopoulou',
    email: 'maria.papadopoulou@doulitsa.com',
    phone: '+30 210 987 6543',
    avatar: '/avatars/maria-admin.jpg',
    role: 'Content Moderator',
    department: 'Content & Safety',
    status: 'Active',
    lastLogin: '2024-01-18 12:15',
    joinDate: '2023-08-20',
    permissions: ['Content Review', 'User Reports', 'Chat Monitoring'],
    location: 'Thessaloniki, Greece',
  },
  {
    id: 3,
    name: 'Dimitris Kostas',
    email: 'dimitris.kostas@doulitsa.com',
    phone: '+30 210 555 1234',
    avatar: '/avatars/dimitris-admin.jpg',
    role: 'Customer Support',
    department: 'Support',
    status: 'Active',
    lastLogin: '2024-01-18 16:45',
    joinDate: '2023-09-10',
    permissions: ['User Support', 'Ticket Management', 'Basic Analytics'],
    location: 'Patras, Greece',
  },
  {
    id: 4,
    name: 'Sofia Nikolaou',
    email: 'sofia.nikolaou@doulitsa.com',
    phone: '+30 210 444 5678',
    avatar: '/avatars/sofia-admin.jpg',
    role: 'Financial Admin',
    department: 'Finance',
    status: 'Inactive',
    lastLogin: '2024-01-15 09:20',
    joinDate: '2023-07-05',
    permissions: [
      'Payment Management',
      'Financial Reports',
      'Transaction Monitoring',
    ],
    location: 'Athens, Greece',
  },
];

export default function TeamPage() {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6'>
      <div className='px-4 lg:px-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Team</h1>
            <p className='text-muted-foreground'>
              Manage admin team members and their permissions
            </p>
          </div>
          <Button>
            <UserPlusIcon className='mr-2 h-4 w-4' />
            Add Team Member
          </Button>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>12</div>
              <p className='text-xs text-muted-foreground'>
                Active administrators
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Online Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>8</div>
              <p className='text-xs text-muted-foreground'>Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>5</div>
              <p className='text-xs text-muted-foreground'>
                Active departments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Super Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>3</div>
              <p className='text-xs text-muted-foreground'>Full access level</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <Tabs defaultValue='all' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='all'>All Members</TabsTrigger>
              <TabsTrigger value='active'>Active</TabsTrigger>
              <TabsTrigger value='admins'>Super Admins</TabsTrigger>
              <TabsTrigger value='departments'>By Department</TabsTrigger>
            </TabsList>

            <div className='flex items-center space-x-2'>
              <div className='relative'>
                <SearchIcon className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search team members...'
                  className='pl-8 w-64'
                />
              </div>
              <Select>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Department' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Departments</SelectItem>
                  <SelectItem value='management'>Management</SelectItem>
                  <SelectItem value='content'>Content & Safety</SelectItem>
                  <SelectItem value='support'>Support</SelectItem>
                  <SelectItem value='finance'>Finance</SelectItem>
                  <SelectItem value='technical'>Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value='all' className='space-y-4'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {teamData.map((member) => (
                <Card
                  key={member.id}
                  className={
                    member.status === 'Inactive'
                      ? 'border-gray-300 opacity-75'
                      : ''
                  }
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-3'>
                        <UserAvatar
                          displayName={member.name}
                          image={member.avatar}
                          size='md'
                          className='h-12 w-12'
                          showBorder={false}
                          showShadow={false}
                        />
                        <div>
                          <div className='flex items-center gap-2'>
                            <CardTitle className='text-base'>
                              {member.name}
                            </CardTitle>
                            {member.role === 'Super Admin' && (
                              <ShieldIcon className='h-4 w-4 text-yellow-500' />
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          member.status === 'Active' ? 'default' : 'secondary'
                        }
                        className={
                          member.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : ''
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <Badge variant='outline' className='mb-2'>
                        {member.department}
                      </Badge>
                      <div className='space-y-1 text-sm'>
                        <div className='flex items-center gap-2'>
                          <MailIcon className='h-3 w-3 text-muted-foreground' />
                          <span className='text-muted-foreground'>
                            {member.email}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <PhoneIcon className='h-3 w-3 text-muted-foreground' />
                          <span className='text-muted-foreground'>
                            {member.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='text-sm'>
                      <div className='text-muted-foreground mb-1'>
                        Permissions:
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {member.permissions
                          .slice(0, 2)
                          .map((permission, index) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'
                            >
                              {permission}
                            </Badge>
                          ))}
                        {member.permissions.length > 2 && (
                          <Badge variant='outline' className='text-xs'>
                            +{member.permissions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className='text-xs text-muted-foreground'>
                      <div>Last login: {member.lastLogin}</div>
                      <div>Joined: {member.joinDate}</div>
                      <div>{member.location}</div>
                    </div>

                    <div className='flex gap-2 pt-2'>
                      <Button variant='outline' size='sm' className='flex-1'>
                        <EditIcon className='mr-1 h-3 w-3' />
                        Edit
                      </Button>
                      <Button variant='outline' size='sm'>
                        <TrashIcon className='h-3 w-3' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='active' className='space-y-4'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {teamData
                .filter((member) => member.status === 'Active')
                .map((member) => (
                  <Card key={member.id} className='border-green-200'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center space-x-3'>
                          <UserAvatar
                            displayName={member.name}
                            image={member.avatar}
                            size='md'
                            className='h-12 w-12'
                            showBorder={false}
                          />
                          <div>
                            <div className='flex items-center gap-2'>
                              <CardTitle className='text-base'>
                                {member.name}
                              </CardTitle>
                              {member.role === 'Super Admin' && (
                                <ShieldIcon className='h-4 w-4 text-yellow-500' />
                              )}
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant='default'
                          className='bg-green-100 text-green-800'
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div>
                        <Badge variant='outline' className='mb-2'>
                          {member.department}
                        </Badge>
                        <div className='space-y-1 text-sm'>
                          <div className='flex items-center gap-2'>
                            <MailIcon className='h-3 w-3 text-muted-foreground' />
                            <span className='text-muted-foreground'>
                              {member.email}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <PhoneIcon className='h-3 w-3 text-muted-foreground' />
                            <span className='text-muted-foreground'>
                              {member.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='text-sm'>
                        <div className='text-muted-foreground mb-1'>
                          Permissions:
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {member.permissions
                            .slice(0, 2)
                            .map((permission, index) => (
                              <Badge
                                key={index}
                                variant='outline'
                                className='text-xs'
                              >
                                {permission}
                              </Badge>
                            ))}
                          {member.permissions.length > 2 && (
                            <Badge variant='outline' className='text-xs'>
                              +{member.permissions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className='text-xs text-muted-foreground'>
                        <div>Last login: {member.lastLogin}</div>
                        <div>{member.location}</div>
                      </div>

                      <div className='flex gap-2 pt-2'>
                        <Button variant='outline' size='sm' className='flex-1'>
                          <EditIcon className='mr-1 h-3 w-3' />
                          Edit
                        </Button>
                        <Button variant='outline' size='sm'>
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='admins' className='space-y-4'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {teamData
                .filter((member) => member.role === 'Super Admin')
                .map((member) => (
                  <Card key={member.id} className='border-yellow-200'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center space-x-3'>
                          <UserAvatar
                            displayName={member.name}
                            image={member.avatar}
                            size='md'
                            className='h-12 w-12'
                            showBorder={false}
                          />
                          <div>
                            <div className='flex items-center gap-2'>
                              <CardTitle className='text-base'>
                                {member.name}
                              </CardTitle>
                              <ShieldIcon className='h-4 w-4 text-yellow-500' />
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant='default'
                          className='bg-yellow-100 text-yellow-800'
                        >
                          Super Admin
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div>
                        <Badge variant='outline' className='mb-2'>
                          {member.department}
                        </Badge>
                        <div className='space-y-1 text-sm'>
                          <div className='flex items-center gap-2'>
                            <MailIcon className='h-3 w-3 text-muted-foreground' />
                            <span className='text-muted-foreground'>
                              {member.email}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <PhoneIcon className='h-3 w-3 text-muted-foreground' />
                            <span className='text-muted-foreground'>
                              {member.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='text-sm'>
                        <div className='text-muted-foreground mb-1'>
                          Full System Access
                        </div>
                        <Badge
                          variant='default'
                          className='text-xs bg-yellow-100 text-yellow-800'
                        >
                          All Permissions
                        </Badge>
                      </div>

                      <div className='text-xs text-muted-foreground'>
                        <div>Last login: {member.lastLogin}</div>
                        <div>Joined: {member.joinDate}</div>
                        <div>{member.location}</div>
                      </div>

                      <div className='flex gap-2 pt-2'>
                        <Button variant='outline' size='sm' className='flex-1'>
                          <EditIcon className='mr-1 h-3 w-3' />
                          Edit
                        </Button>
                        <Button variant='outline' size='sm'>
                          Permissions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='departments' className='space-y-6'>
            {['Management', 'Content & Safety', 'Support', 'Finance'].map(
              (dept) => (
                <Card key={dept}>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      {dept}
                      <Badge variant='outline'>
                        {
                          teamData.filter(
                            (member) => member.department === dept,
                          ).length
                        }{' '}
                        members
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {teamData
                        .filter((member) => member.department === dept)
                        .map((member) => (
                          <div
                            key={member.id}
                            className='flex items-center space-x-3 p-4 border rounded-lg'
                          >
                            <UserAvatar
                              displayName={member.name}
                              image={member.avatar}
                              size='sm'
                              className='h-10 w-10'
                              showBorder={false}
                              showShadow={false}
                            />
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <div className='font-medium'>{member.name}</div>
                                {member.role === 'Super Admin' && (
                                  <ShieldIcon className='h-4 w-4 text-yellow-500' />
                                )}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {member.role}
                              </div>
                              <Badge
                                variant={
                                  member.status === 'Active'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={`text-xs ${member.status === 'Active' ? 'bg-green-100 text-green-800' : ''}`}
                              >
                                {member.status}
                              </Badge>
                            </div>
                            <Button variant='outline' size='sm'>
                              <EditIcon className='h-3 w-3' />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
