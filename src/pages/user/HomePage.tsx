import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Star, Search, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center opacity-40" />
        <div className="relative container flex flex-col items-center space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Discover Your Next Adventure
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-[600px] mx-auto">
              Explore the world's most beautiful destinations with our curated
              tours.
            </p>
          </div>

          {/* Search Widget */}
          <Card className="w-full max-w-4xl bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-0 shadow-2xl">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr,auto] gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Where do you want to go?"
                    className="pl-10 h-12 text-base bg-white text-black border-slate-200 focus-visible:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10 h-12 text-base bg-white text-black border-slate-200 focus-visible:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Guests"
                    type="number"
                    min={1}
                    className="pl-10 h-12 text-base bg-white text-black border-slate-200 focus-visible:ring-primary"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-semibold shadow-lg"
                >
                  <Search className="mr-2 h-5 w-5" /> Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Popular Destinations
          </h2>
          <Button variant="link">View all</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
            >
              <div className="aspect-video w-full bg-muted relative">
                <img
                  src={`https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                  alt="Tour"
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xl">Mountain Trekking</h3>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Swiss Alps</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-secondary px-2 py-1 rounded text-xs font-medium">
                    <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                    4.9
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />7 Days
                  </div>
                  <div>From $1,299</div>
                </div>

                <Button className="w-full">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
