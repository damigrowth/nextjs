import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchIcon, UserCheckIcon, StarIcon, EyeIcon } from "lucide-react"

export const dynamic = 'force-dynamic';

const profilesData = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    avatar: "/avatars/john.jpg",
    type: "Freelancer",
    category: "Web Development",
    rating: 4.8,
    reviews: 156,
    verified: true,
    completeness: 95,
    joinDate: "2024-01-15",
    location: "Athens, Greece",
    description: "Full-stack developer with 5+ years experience in React and Node.js"
  },
  {
    id: 2,
    name: "Maria Kostas",
    username: "mariakostas",
    avatar: "/avatars/maria.jpg",
    type: "Freelancer",
    category: "Graphic Design",
    rating: 4.9,
    reviews: 234,
    verified: true,
    completeness: 88,
    joinDate: "2023-11-20",
    location: "Thessaloniki, Greece",
    description: "Creative graphic designer specializing in brand identity and digital art"
  },
  {
    id: 3,
    name: "Alex Papadopoulos",
    username: "alexpapadopoulos",
    avatar: "/avatars/alex.jpg",
    type: "Freelancer",
    category: "Digital Marketing",
    rating: 4.6,
    reviews: 89,
    verified: false,
    completeness: 72,
    joinDate: "2024-01-05",
    location: "Patras, Greece",
    description: "Digital marketing expert with focus on social media and content strategy"
  },
  {
    id: 4,
    name: "Sofia Dimitriou",
    username: "sofiadimitriou",
    avatar: "/avatars/sofia.jpg",
    type: "Freelancer",
    category: "Translation",
    rating: 5.0,
    reviews: 67,
    verified: true,
    completeness: 92,
    joinDate: "2023-12-10",
    location: "Rhodes, Greece",
    description: "Professional translator for Greek, English, and German languages"
  }
]

export default function ProfilesPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
            <p className="text-muted-foreground">
              Manage freelancer profiles and verification status
            </p>
          </div>
          <Button>
            <UserCheckIcon className="mr-2 h-4 w-4" />
            Review Profiles
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Active freelancer profiles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">987</div>
              <p className="text-xs text-muted-foreground">
                80% verification rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complete Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,087</div>
              <p className="text-xs text-muted-foreground">
                88% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7</div>
              <p className="text-xs text-muted-foreground">
                Out of 5 stars
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Profiles</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search profiles..." className="pl-8 w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web-dev">Web Development</SelectItem>
                  <SelectItem value="design">Graphic Design</SelectItem>
                  <SelectItem value="marketing">Digital Marketing</SelectItem>
                  <SelectItem value="translation">Translation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {profilesData.map((profile) => (
                <Card key={profile.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.avatar} alt={profile.name} />
                          <AvatarFallback>
                            {profile.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{profile.name}</CardTitle>
                            {profile.verified && (
                              <Badge variant="default" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {profile.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{profile.rating}</span>
                        <span className="text-muted-foreground">({profile.reviews})</span>
                      </div>
                      <div className="text-muted-foreground">
                        {profile.completeness}% complete
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div>{profile.location}</div>
                      <div>Joined {profile.joinDate}</div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <EyeIcon className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {profilesData.filter(profile => profile.verified).map((profile) => (
                <Card key={profile.id} className="overflow-hidden border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.avatar} alt={profile.name} />
                          <AvatarFallback>
                            {profile.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{profile.name}</CardTitle>
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {profile.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{profile.rating}</span>
                        <span className="text-muted-foreground">({profile.reviews})</span>
                      </div>
                      <div className="text-muted-foreground">
                        {profile.completeness}% complete
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div>{profile.location}</div>
                      <div>Joined {profile.joinDate}</div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <EyeIcon className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {profilesData.filter(profile => !profile.verified).map((profile) => (
                <Card key={profile.id} className="overflow-hidden border-yellow-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.avatar} alt={profile.name} />
                          <AvatarFallback>
                            {profile.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{profile.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {profile.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{profile.rating}</span>
                        <span className="text-muted-foreground">({profile.reviews})</span>
                      </div>
                      <div className="text-muted-foreground">
                        {profile.completeness}% complete
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div>{profile.location}</div>
                      <div>Joined {profile.joinDate}</div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Reject
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Verify
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="incomplete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incomplete Profiles</CardTitle>
                <CardDescription>Profiles that need more information to be complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {profilesData.filter(profile => profile.completeness < 80).map((profile) => (
                    <div key={profile.id} className="p-4 border rounded-lg border-orange-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar} alt={profile.name} />
                          <AvatarFallback>
                            {profile.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-sm text-muted-foreground">@{profile.username}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Profile Completion</span>
                          <span className="font-medium">{profile.completeness}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${profile.completeness}%` }}
                          ></div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}