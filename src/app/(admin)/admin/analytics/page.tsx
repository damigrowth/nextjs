import { ChartAreaInteractive } from '@/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Analytics</h1>
            <p className='text-muted-foreground'>
              View detailed analytics and insights about your platform
            </p>
          </div>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='users'>Users</TabsTrigger>
            <TabsTrigger value='services'>Services</TabsTrigger>
            <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>12,543</div>
                  <p className='text-xs text-muted-foreground'>
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>2,543</div>
                  <p className='text-xs text-muted-foreground'>
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>€45,231</div>
                  <p className='text-xs text-muted-foreground'>
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Completed Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>1,423</div>
                  <p className='text-xs text-muted-foreground'>
                    +15.3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <ChartAreaInteractive />
          </TabsContent>

          <TabsContent value='users' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+573</div>
                  <p className='text-xs text-muted-foreground'>This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>
                    Users active in the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>8,432</div>
                  <p className='text-xs text-muted-foreground'>
                    67% of total users
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Freelancers</CardTitle>
                  <CardDescription>
                    Professional service providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>1,234</div>
                  <p className='text-xs text-muted-foreground'>
                    Active freelancers
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='services' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Published Services</CardTitle>
                  <CardDescription>Total services available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>2,543</div>
                  <p className='text-xs text-muted-foreground'>
                    +123 this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Popular Categories</CardTitle>
                  <CardDescription>
                    Most requested service types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-sm space-y-1'>
                    <div>Web Development (23%)</div>
                    <div>Graphic Design (18%)</div>
                    <div>Digital Marketing (15%)</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Service Rating</CardTitle>
                  <CardDescription>Average service rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>4.8/5</div>
                  <p className='text-xs text-muted-foreground'>
                    Based on 1,234 reviews
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='revenue' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>This month's earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>€45,231</div>
                  <p className='text-xs text-muted-foreground'>
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Commission Earned</CardTitle>
                  <CardDescription>Platform commission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>€9,046</div>
                  <p className='text-xs text-muted-foreground'>
                    20% commission rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Payout Processed</CardTitle>
                  <CardDescription>Payments to freelancers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>€36,185</div>
                  <p className='text-xs text-muted-foreground'>
                    80% to freelancers
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
