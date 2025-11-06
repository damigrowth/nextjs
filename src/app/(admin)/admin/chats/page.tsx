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
import { UserAvatar } from '@/components/shared';
import { SearchIcon, MessageSquareIcon, EyeIcon, FlagIcon } from 'lucide-react';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

const chatsData = [
  {
    id: 1,
    participants: ['John Doe', 'Maria Client'],
    avatars: ['/avatars/john.jpg', '/avatars/maria.jpg'],
    lastMessage: "I'll have the website ready by Friday",
    lastMessageTime: '2 minutes ago',
    messageCount: 47,
    status: 'Active',
    priority: 'Normal',
    reportCount: 0,
    projectTitle: 'WordPress Website Development',
  },
  {
    id: 2,
    participants: ['Alex Papadopoulos', 'Sofia Business'],
    avatars: ['/avatars/alex.jpg', '/avatars/sofia.jpg'],
    lastMessage: 'The marketing strategy looks great!',
    lastMessageTime: '15 minutes ago',
    messageCount: 23,
    status: 'Active',
    priority: 'Normal',
    reportCount: 0,
    projectTitle: 'Social Media Marketing',
  },
  {
    id: 3,
    participants: ['Mike Designer', 'Corporate Client'],
    avatars: ['/avatars/mike.jpg', '/avatars/corporate.jpg'],
    lastMessage: 'This is inappropriate content',
    lastMessageTime: '1 hour ago',
    messageCount: 15,
    status: 'Reported',
    priority: 'High',
    reportCount: 2,
    projectTitle: 'Brand Identity Design',
  },
  {
    id: 4,
    participants: ['Elena Translator', 'Global Corp'],
    avatars: ['/avatars/elena.jpg', '/avatars/global.jpg'],
    lastMessage: 'Translation completed successfully',
    lastMessageTime: '3 hours ago',
    messageCount: 8,
    status: 'Completed',
    priority: 'Normal',
    reportCount: 0,
    projectTitle: 'Document Translation',
  },
];

export default function ChatsPage() {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Chats</h1>
            <p className='text-muted-foreground'>
              Monitor and moderate chat conversations between users
            </p>
          </div>
          <Button>
            <MessageSquareIcon className='mr-2 h-4 w-4' />
            Monitor All
          </Button>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>1,234</div>
              <p className='text-xs text-muted-foreground'>Currently ongoing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Reported Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>12</div>
              <p className='text-xs text-muted-foreground'>Require attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Messages Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>5,672</div>
              <p className='text-xs text-muted-foreground'>
                +15% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>2.3h</div>
              <p className='text-xs text-muted-foreground'>Across platform</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <Tabs defaultValue='all' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='all'>All Chats</TabsTrigger>
              <TabsTrigger value='active'>Active</TabsTrigger>
              <TabsTrigger value='reported'>Reported</TabsTrigger>
              <TabsTrigger value='completed'>Completed</TabsTrigger>
            </TabsList>

            <div className='flex items-center space-x-2'>
              <div className='relative'>
                <SearchIcon className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input placeholder='Search chats...' className='pl-8 w-64' />
              </div>
              <Select>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Priority' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Priorities</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='normal'>Normal</SelectItem>
                  <SelectItem value='low'>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value='all' className='space-y-4'>
            <div className='space-y-4'>
              {chatsData.map((chat) => (
                <Card
                  key={chat.id}
                  className={chat.status === 'Reported' ? 'border-red-200' : ''}
                >
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 space-y-3'>
                        <div className='flex items-start space-x-4'>
                          <div className='flex -space-x-2'>
                            {chat.avatars.map((avatar, index) => (
                              <UserAvatar
                                key={index}
                                displayName={chat.participants[index]}
                                image={avatar}
                                size='sm'
                                className='h-10 w-10 border-2 border-white'
                                showBorder={false}
                                showShadow={false}
                              />
                            ))}
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h3 className='font-semibold'>
                                {chat.participants.join(' & ')}
                              </h3>
                              <Badge
                                variant={
                                  chat.status === 'Active'
                                    ? 'default'
                                    : chat.status === 'Reported'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {chat.status}
                              </Badge>
                              {chat.priority === 'High' && (
                                <Badge variant='destructive'>
                                  High Priority
                                </Badge>
                              )}
                              {chat.reportCount > 0 && (
                                <Badge
                                  variant='outline'
                                  className='text-red-600'
                                >
                                  <FlagIcon className='mr-1 h-3 w-3' />
                                  {chat.reportCount} Reports
                                </Badge>
                              )}
                            </div>
                            <p className='text-sm text-muted-foreground mb-1'>
                              Project: {chat.projectTitle}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              Last: "{chat.lastMessage}"
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center justify-between text-sm'>
                          <div className='flex items-center space-x-4'>
                            <span className='text-muted-foreground'>
                              {chat.messageCount} messages
                            </span>
                            <span className='text-muted-foreground'>
                              {chat.lastMessageTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col gap-2 ml-4'>
                        <Button variant='outline' size='sm'>
                          <EyeIcon className='mr-1 h-3 w-3' />
                          View Chat
                        </Button>
                        {chat.status === 'Reported' && (
                          <>
                            <Button variant='destructive' size='sm'>
                              Suspend Chat
                            </Button>
                            <Button variant='outline' size='sm'>
                              Dismiss Report
                            </Button>
                          </>
                        )}
                        {chat.status === 'Active' && (
                          <Button variant='outline' size='sm'>
                            Monitor
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='active' className='space-y-4'>
            <div className='space-y-4'>
              {chatsData
                .filter((chat) => chat.status === 'Active')
                .map((chat) => (
                  <Card key={chat.id} className='border-green-200'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start space-x-4'>
                            <div className='flex -space-x-2'>
                              {chat.avatars.map((avatar, index) => (
                                <UserAvatar
                                  key={index}
                                  displayName={chat.participants[index]}
                                  image={avatar}
                                  size='sm'
                                  className='h-10 w-10 border-2 border-white'
                                  showBorder={false}
                                />
                              ))}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold'>
                                  {chat.participants.join(' & ')}
                                </h3>
                                <Badge
                                  variant='default'
                                  className='bg-green-100 text-green-800'
                                >
                                  {chat.status}
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground mb-1'>
                                Project: {chat.projectTitle}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Last: "{chat.lastMessage}"
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center space-x-4'>
                              <span className='text-muted-foreground'>
                                {chat.messageCount} messages
                              </span>
                              <span className='text-muted-foreground'>
                                {chat.lastMessageTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 ml-4'>
                          <Button variant='outline' size='sm'>
                            <EyeIcon className='mr-1 h-3 w-3' />
                            View Chat
                          </Button>
                          <Button variant='outline' size='sm'>
                            Monitor
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='reported' className='space-y-4'>
            <div className='space-y-4'>
              {chatsData
                .filter((chat) => chat.status === 'Reported')
                .map((chat) => (
                  <Card key={chat.id} className='border-red-200'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start space-x-4'>
                            <div className='flex -space-x-2'>
                              {chat.avatars.map((avatar, index) => (
                                <UserAvatar
                                  key={index}
                                  displayName={chat.participants[index]}
                                  image={avatar}
                                  size='sm'
                                  className='h-10 w-10 border-2 border-white'
                                  showBorder={false}
                                />
                              ))}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold'>
                                  {chat.participants.join(' & ')}
                                </h3>
                                <Badge variant='destructive'>
                                  {chat.status}
                                </Badge>
                                <Badge variant='destructive'>
                                  High Priority
                                </Badge>
                                <Badge
                                  variant='outline'
                                  className='text-red-600'
                                >
                                  <FlagIcon className='mr-1 h-3 w-3' />
                                  {chat.reportCount} Reports
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground mb-1'>
                                Project: {chat.projectTitle}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Last: "{chat.lastMessage}"
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center space-x-4'>
                              <span className='text-muted-foreground'>
                                {chat.messageCount} messages
                              </span>
                              <span className='text-muted-foreground'>
                                {chat.lastMessageTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 ml-4'>
                          <Button variant='outline' size='sm'>
                            <EyeIcon className='mr-1 h-3 w-3' />
                            Review Chat
                          </Button>
                          <Button variant='destructive' size='sm'>
                            Suspend Chat
                          </Button>
                          <Button variant='outline' size='sm'>
                            Dismiss Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='completed' className='space-y-4'>
            <div className='space-y-4'>
              {chatsData
                .filter((chat) => chat.status === 'Completed')
                .map((chat) => (
                  <Card key={chat.id} className='border-gray-200'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start space-x-4'>
                            <div className='flex -space-x-2'>
                              {chat.avatars.map((avatar, index) => (
                                <UserAvatar
                                  key={index}
                                  displayName={chat.participants[index]}
                                  image={avatar}
                                  size='sm'
                                  className='h-10 w-10 border-2 border-white'
                                  showBorder={false}
                                />
                              ))}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold'>
                                  {chat.participants.join(' & ')}
                                </h3>
                                <Badge variant='secondary'>{chat.status}</Badge>
                              </div>
                              <p className='text-sm text-muted-foreground mb-1'>
                                Project: {chat.projectTitle}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Last: "{chat.lastMessage}"
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center space-x-4'>
                              <span className='text-muted-foreground'>
                                {chat.messageCount} messages
                              </span>
                              <span className='text-muted-foreground'>
                                {chat.lastMessageTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 ml-4'>
                          <Button variant='outline' size='sm'>
                            <EyeIcon className='mr-1 h-3 w-3' />
                            View Archive
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
