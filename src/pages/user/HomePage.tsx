import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center opacity-40" />
        <div className="relative container text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-[600px] mx-auto">
            Explore the world's most beautiful destinations with our curated
            tours.
          </p>
          <div className="pt-4">
            <Button size="lg" className="text-lg px-8">
              Explore Tours
            </Button>
          </div>
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
