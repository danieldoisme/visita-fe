import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MapPin, Calendar, Search, Filter } from "lucide-react";

// Mock Data
const TOURS = [
  {
    id: 1,
    title: "Swiss Alps Trekking",
    location: "Switzerland",
    price: 1299,
    duration: "7 Days",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Adventure",
  },
  {
    id: 2,
    title: "Kyoto Cultural Walk",
    location: "Japan",
    price: 899,
    duration: "5 Days",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Cultural",
  },
  {
    id: 3,
    title: "Safari Adventure",
    location: "Kenya",
    price: 2499,
    duration: "10 Days",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Wildlife",
  },
  {
    id: 4,
    title: "Paris City Tour",
    location: "France",
    price: 599,
    duration: "3 Days",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "City",
  },
];

export default function ToursPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTours = TOURS.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tours</h1>
          <p className="text-muted-foreground">
            Explore our collection of hand-picked destinations.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-tours"
              name="search"
              placeholder="Search destinations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTours.map((tour) => (
          <Card key={tour.id} className="overflow-hidden flex flex-col">
            <div className="aspect-video w-full bg-muted relative">
              <img
                src={tour.image}
                alt={tour.title}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-2 right-2 bg-white/90 text-black hover:bg-white/100">
                {tour.category}
              </Badge>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{tour.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {tour.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {tour.duration}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/10 mt-auto">
              <div className="font-bold text-lg">${tour.price}</div>
              <Button size="sm">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTours.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No tours found matching your search.
          </p>
          <Button variant="link" onClick={() => setSearchTerm("")}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
