import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchIcon, PlusIcon, StarIcon, EyeIcon, EditIcon, TrashIcon } from "lucide-react"

const servicesData = [
  {
    id: 1,
    title: "Professional WordPress Website Development",
    freelancer: "John Doe",
    freelancerAvatar: "/avatars/john.jpg",
    category: "Web Development",
    price: "€150",
    status: "Active",
    rating: 4.8,
    reviews: 42,
    orders: 156,
    featured: true,
    publishDate: "2024-01-15",
    description: "I will create a professional WordPress website with custom design and functionality"
  },
  {
    id: 2,
    title: "Brand Identity Design Package",
    freelancer: "Maria Kostas",
    freelancerAvatar: "/avatars/maria.jpg",
    category: "Graphic Design",
    price: "€200",
    status: "Under Review",
    rating: 4.9,
    reviews: 28,
    orders: 89,
    featured: false,
    publishDate: "2024-01-18",
    description: "Complete brand identity design including logo, business cards, and brand guidelines"
  },
  {
    id: 3,
    title: "Social Media Marketing Strategy",
    freelancer: "Alex Papadopoulos",
    freelancerAvatar: "/avatars/alex.jpg",
    category: "Digital Marketing",
    price: "€120",
    status: "Active",
    rating: 4.6,
    reviews: 34,
    orders: 67,
    featured: true,
    publishDate: "2024-01-10",
    description: "Comprehensive social media strategy and content calendar for your business"
  },
  {
    id: 4,
    title: "Professional Greek to English Translation",
    freelancer: "Sofia Dimitriou",
    freelancerAvatar: "/avatars/sofia.jpg",
    category: "Translation",
    price: "€50",
    status: "Suspended",
    rating: 5.0,
    reviews: 67,
    orders: 234,
    featured: false,
    publishDate: "2023-12-10",
    description: "Accurate and professional translation services for documents and websites"
  }
]

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Manage services, approvals, and featured listings
            </p>
          </div>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">
                +123 this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,234</div>
              <p className="text-xs text-muted-foreground">
                88% of total services
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                Pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Premium listings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Services</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="review">Under Review</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search services..." className="pl-8 w-64" />
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
            <div className="space-y-4">
              {servicesData.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={service.freelancerAvatar} alt={service.freelancer} />
                            <AvatarFallback>
                              {service.freelancer.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{service.title}</h3>
                              {service.featured && (
                                <Badge variant="default" className="bg-yellow-500 text-yellow-900">
                                  Featured
                                </Badge>
                              )}
                              <Badge 
                                variant={
                                  service.status === 'Active' ? 'default' : 
                                  service.status === 'Under Review' ? 'secondary' : 
                                  'destructive'
                                }
                              >
                                {service.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {service.freelancer}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <Badge variant="outline">{service.category}</Badge>
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{service.rating}</span>
                              <span className="text-muted-foreground">({service.reviews})</span>
                            </div>
                            <span className="text-muted-foreground">{service.orders} orders</span>
                            <span className="text-muted-foreground">Published {service.publishDate}</span>
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {service.price}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <EditIcon className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <TrashIcon className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="space-y-4">
              {servicesData.filter(service => service.status === 'Active').map((service) => (
                <Card key={service.id} className="overflow-hidden border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={service.freelancerAvatar} alt={service.freelancer} />
                            <AvatarFallback>
                              {service.freelancer.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{service.title}</h3>
                              {service.featured && (
                                <Badge variant="default" className="bg-yellow-500 text-yellow-900">
                                  Featured
                                </Badge>
                              )}
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                {service.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {service.freelancer}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <Badge variant="outline">{service.category}</Badge>
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{service.rating}</span>
                              <span className="text-muted-foreground">({service.reviews})</span>
                            </div>
                            <span className="text-muted-foreground">{service.orders} orders</span>
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {service.price}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Suspend
                        </Button>
                        <Button variant="outline" size="sm" className="bg-yellow-50">
                          Feature
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <div className="space-y-4">
              {servicesData.filter(service => service.status === 'Under Review').map((service) => (
                <Card key={service.id} className="overflow-hidden border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={service.freelancerAvatar} alt={service.freelancer} />
                            <AvatarFallback>
                              {service.freelancer.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{service.title}</h3>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {service.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {service.freelancer}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <Badge variant="outline">{service.category}</Badge>
                            <span className="text-muted-foreground">Submitted {service.publishDate}</span>
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {service.price}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="mr-1 h-3 w-3" />
                          Review
                        </Button>
                        <Button variant="destructive" size="sm">
                          Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-4">
            <div className="space-y-4">
              {servicesData.filter(service => service.featured).map((service) => (
                <Card key={service.id} className="overflow-hidden border-yellow-400">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={service.freelancerAvatar} alt={service.freelancer} />
                            <AvatarFallback>
                              {service.freelancer.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{service.title}</h3>
                              <Badge variant="default" className="bg-yellow-500 text-yellow-900">
                                Featured
                              </Badge>
                              <Badge 
                                variant={
                                  service.status === 'Active' ? 'default' : 
                                  service.status === 'Under Review' ? 'secondary' : 
                                  'destructive'
                                }
                              >
                                {service.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {service.freelancer}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <Badge variant="outline">{service.category}</Badge>
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{service.rating}</span>
                              <span className="text-muted-foreground">({service.reviews})</span>
                            </div>
                            <span className="text-muted-foreground">{service.orders} orders</span>
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {service.price}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Unfeature
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit Position
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suspended" className="space-y-4">
            <div className="space-y-4">
              {servicesData.filter(service => service.status === 'Suspended').map((service) => (
                <Card key={service.id} className="overflow-hidden border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={service.freelancerAvatar} alt={service.freelancer} />
                            <AvatarFallback>
                              {service.freelancer.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{service.title}</h3>
                              <Badge variant="destructive">
                                {service.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {service.freelancer}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <Badge variant="outline">{service.category}</Badge>
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{service.rating}</span>
                              <span className="text-muted-foreground">({service.reviews})</span>
                            </div>
                            <span className="text-muted-foreground">{service.orders} orders</span>
                          </div>
                          <div className="text-xl font-bold text-muted-foreground">
                            {service.price}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Reactivate
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete Permanently
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
  )
}