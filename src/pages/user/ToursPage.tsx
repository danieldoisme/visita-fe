import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Search, 
  Clock, 
  Star, 
  LayoutGrid, 
  List,
  Heart,
  Check,
  ChevronRight,
  SlidersHorizontal,
  X
} from "lucide-react";

// Mock Data
const TOURS = [
  {
    id: 1,
    title: "Majestic Swiss Alps Trekking & Adventure",
    location: "Interlaken, Switzerland",
    price: 1299,
    originalPrice: 1499,
    duration: "7 Days",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Adventure",
    difficulty: "Medium",
    tags: ["Best Seller", "Free Cancellation"],
    features: ["Guide included", "Meals included", "Transport"]
  },
  {
    id: 2,
    title: "Kyoto Cultural Heritage Walk & Tea Ceremony",
    location: "Kyoto, Japan",
    price: 899,
    duration: "5 Days",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Cultural",
    difficulty: "Easy",
    tags: ["Likely to Sell Out"],
    features: ["Small group", "Entrance fees"]
  },
  {
    id: 3,
    title: "Kenya Safari: The Great Migration Experience",
    location: "Masai Mara, Kenya",
    price: 2499,
    duration: "10 Days",
    rating: 5.0,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Wildlife",
    difficulty: "Hard",
    tags: ["Luxury"],
    features: ["Private 4x4", "Luxury Lodges"]
  },
  {
    id: 4,
    title: "Paris Highlights: City of Lights Tour",
    location: "Paris, France",
    price: 599,
    originalPrice: 699,
    duration: "3 Days",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "City",
    difficulty: "Easy",
    tags: ["Mobile Voucher"],
    features: ["Skip the line", "Audio guide"]
  },
  {
    id: 5,
    title: "Inca Trail to Machu Picchu",
    location: "Cusco, Peru",
    price: 1599,
    duration: "6 Days",
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Adventure",
    difficulty: "Hard",
    tags: ["Bucket List"],
    features: ["Porters", "Camping gear"]
  },
  {
    id: 6,
    title: "Santorini Sunset & Wine Tasting",
    location: "Santorini, Greece",
    price: 1199,
    duration: "5 Days",
    rating: 4.8,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2938&auto=format&fit=crop",
    category: "Romantic",
    difficulty: "Easy",
    tags: ["Couples"],
    features: ["Wine tasting", "Sunset cruise"]
  },
];

const CATEGORIES = ["Adventure", "Cultural", "Wildlife", "City", "Romantic", "Beach"];
const DURATIONS = ["1-3 Days", "4-7 Days", "8-14 Days", "15+ Days"];
const RATINGS = [5, 4, 3];

export default function ToursPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredTours = TOURS.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb & Header */}
      <div className="relative bg-slate-900 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" 
            alt="Header Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-slate-900/90" />
        </div>
        <div className="container relative z-10">
          <div className="flex items-center text-sm text-slate-300 mb-6 font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <ChevronRight className="h-4 w-4 mx-3 text-slate-500" />
            <span className="text-white">Tours</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Explore the World
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed">
            Discover {TOURS.length}+ unique experiences, from mountain trekking to city walks. Your next adventure starts here.
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button onClick={() => setShowMobileFilters(true)} className="w-full flex items-center justify-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Sidebar Filters */}
          <aside className={`
            fixed inset-0 z-50 bg-white p-6 lg:p-0 lg:static lg:bg-transparent lg:w-[280px] lg:block overflow-y-auto transition-transform duration-300 ease-in-out
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-8">
              {/* Search */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search tours..." 
                    className="pl-9 bg-white border-slate-200 focus-visible:ring-primary" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Price Range</h3>
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="100"
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="peer h-4 w-4 border-slate-300 rounded text-primary focus:ring-primary" />
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Duration</h3>
                <div className="space-y-2">
                  {DURATIONS.map((dur) => (
                    <label key={dur} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                      <input type="checkbox" className="h-4 w-4 border-slate-300 rounded text-primary focus:ring-primary" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium">{dur}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Rating</h3>
                <div className="space-y-2">
                  {RATINGS.map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                      <input type="checkbox" className="h-4 w-4 border-slate-300 rounded text-primary focus:ring-primary" />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`} 
                          />
                        ))}
                        <span className="text-sm text-slate-600 ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground font-medium">
                <span className="text-foreground font-bold">{filteredTours.length}</span> results found
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-slate-100 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-slate-100 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Duration: Short to Long</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filteredTours.map((tour) => (
                <Card key={tour.id} className={`group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl ${viewMode === "list" ? "flex flex-col md:flex-row" : "flex flex-col"}`}>
                  {/* Image Section */}
                  <div className={`relative overflow-hidden ${viewMode === "list" ? "w-full md:w-[320px] h-[240px] md:h-auto" : "aspect-[4/3] w-full"}`}>
                    <img 
                      src={tour.image} 
                      alt={tour.title} 
                      className="object-cover w-full h-full hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {tour.tags?.map((tag, i) => (
                        <Badge key={i} className="bg-white/90 text-slate-900 hover:bg-white shadow-sm backdrop-blur-sm border-0 font-semibold">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <button className="absolute top-3 right-3 p-2.5 rounded-full bg-black/20 text-white hover:bg-white hover:text-red-500 backdrop-blur-sm transition-all duration-300">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                        {tour.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-slate-900">{tour.rating}</span>
                        <span className="text-xs text-muted-foreground">({tour.reviews})</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {tour.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {tour.duration}
                      </div>
                      {tour.features?.slice(0, 2).map((feature, i) => (
                        <div key={i} className="flex items-center text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          <Check className="h-3 w-3 mr-1.5 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                      <div className="flex flex-col">
                        {tour.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through mb-0.5">
                            ${tour.originalPrice}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-muted-foreground font-medium">From</span>
                          <span className="text-xl font-bold text-primary">${tour.price}</span>
                        </div>
                      </div>
                      <Button className="rounded-xl px-6 font-semibold shadow-none hover:shadow-md transition-all">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
                <Button variant="ghost" disabled className="rounded-lg">Previous</Button>
                <Button variant="secondary" className="w-10 h-10 p-0 rounded-lg font-bold bg-primary/10 text-primary hover:bg-primary/20">1</Button>
                <Button variant="ghost" className="w-10 h-10 p-0 rounded-lg">2</Button>
                <Button variant="ghost" className="w-10 h-10 p-0 rounded-lg">3</Button>
                <span className="text-muted-foreground px-2">...</span>
                <Button variant="ghost" className="rounded-lg">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-800 shadow-2xl">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Background" 
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800/40" />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 md:p-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium">24/7 Live Support</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  Ready to plan your <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">dream vacation?</span>
                </h2>
                
                <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                  Our expert travel consultants are available round the clock to help you craft the perfect itinerary. No question is too small.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button size="lg" className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-base shadow-lg hover:scale-105 transition-all duration-300">
                    <span className="mr-2">📞</span> Call +1 (555) 123-4567
                  </Button>
                  <Button size="lg" className="h-14 px-8 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-white hover:border-white/40 font-medium text-base backdrop-blur-md transition-all">
                    Chat with an Expert
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block relative">
                <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      JD
                    </div>
                    <div>
                      <h4 className="text-white font-bold">John Doe</h4>
                      <p className="text-slate-400 text-sm">Travel Specialist</p>
                    </div>
                    <div className="ml-auto text-yellow-400 flex">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-slate-200 italic">
                    "We had an amazing time in Switzerland! The itinerary was perfect and the support team was always there when we needed them. Highly recommended!"
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
