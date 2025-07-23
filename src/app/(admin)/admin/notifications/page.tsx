import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BellIcon, CheckIcon, XIcon } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "user",
    title: "New User Registration",
    message: "John Doe has registered as a freelancer",
    time: "2 minutes ago",
    status: "unread",
    priority: "medium"
  },
  {
    id: 2,
    type: "service",
    title: "Service Under Review",
    message: "Web Development service requires admin approval",
    time: "15 minutes ago",
    status: "unread",
    priority: "high"
  },
  {
    id: 3,
    type: "payment",
    title: "Payment Issue",
    message: "Payment failed for order #1234",
    time: "1 hour ago",
    status: "read",
    priority: "high"
  },
  {
    id: 4,
    type: "report",
    title: "User Report",
    message: "Service reported for inappropriate content",
    time: "2 hours ago",
    status: "unread",
    priority: "high"
  },
  {
    id: 5,
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance completed successfully",
    time: "1 day ago",
    status: "read",
    priority: "low"
  }
]

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Manage system notifications and alerts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Mark All as Read
            </Button>
            <Button size="sm">
              <BellIcon className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread (3)</TabsTrigger>
            <TabsTrigger value="high">High Priority</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={notification.status === 'unread' ? 'border-blue-200' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">
                          {notification.title}
                        </CardTitle>
                        <Badge 
                          variant={
                            notification.priority === 'high' ? 'destructive' : 
                            notification.priority === 'medium' ? 'default' : 
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                        {notification.status === 'unread' && (
                          <Badge variant="outline" className="text-xs bg-blue-50">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {notification.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <div className="space-y-4">
              {notifications.filter(n => n.status === 'unread').map((notification) => (
                <Card key={notification.id} className="border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">
                          {notification.title}
                        </CardTitle>
                        <Badge 
                          variant={
                            notification.priority === 'high' ? 'destructive' : 
                            notification.priority === 'medium' ? 'default' : 
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          New
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {notification.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="high" className="space-y-4">
            <div className="space-y-4">
              {notifications.filter(n => n.priority === 'high').map((notification) => (
                <Card key={notification.id} className={notification.status === 'unread' ? 'border-blue-200' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">
                          {notification.title}
                        </CardTitle>
                        <Badge variant="destructive" className="text-xs">
                          {notification.priority}
                        </Badge>
                        {notification.status === 'unread' && (
                          <Badge variant="outline" className="text-xs bg-blue-50">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {notification.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-4">
              {notifications.filter(n => n.type === 'system').map((notification) => (
                <Card key={notification.id} className={notification.status === 'unread' ? 'border-blue-200' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">
                          {notification.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {notification.priority}
                        </Badge>
                        {notification.status === 'unread' && (
                          <Badge variant="outline" className="text-xs bg-blue-50">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {notification.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}