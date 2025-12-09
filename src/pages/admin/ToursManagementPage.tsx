import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

// Mock Data
const TOURS = [
  {
    id: 1,
    title: "Swiss Alps Trekking",
    location: "Switzerland",
    price: 1299,
    status: "Active",
    bookings: 24,
  },
  {
    id: 2,
    title: "Kyoto Cultural Walk",
    location: "Japan",
    price: 899,
    status: "Active",
    bookings: 18,
  },
  {
    id: 3,
    title: "Safari Adventure",
    location: "Kenya",
    price: 2499,
    status: "Draft",
    bookings: 0,
  },
  {
    id: 4,
    title: "Paris City Tour",
    location: "France",
    price: 599,
    status: "Active",
    bookings: 45,
  },
  {
    id: 5,
    title: "Grand Canyon Hike",
    location: "USA",
    price: 450,
    status: "Inactive",
    bookings: 12,
  },
];

export default function ToursManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tours</h2>
          <p className="text-muted-foreground">
            Manage your tour packages and listings.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Tour
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input name="search" placeholder="Search tours..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOURS.map((tour) => (
              <TableRow key={tour.id}>
                <TableCell className="font-medium">{tour.title}</TableCell>
                <TableCell>{tour.location}</TableCell>
                <TableCell>${tour.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tour.status === "Active"
                        ? "default"
                        : tour.status === "Draft"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {tour.status}
                  </Badge>
                </TableCell>
                <TableCell>{tour.bookings}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
