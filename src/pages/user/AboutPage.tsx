import {
  Users,
  Globe,
  Award,
  Heart,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section - More Immersive */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Phố cổ Hội An"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 container px-4 text-center text-white space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge
            variant="outline"
            className="text-white border-white/50 px-4 py-1 text-sm uppercase tracking-widest backdrop-blur-sm"
          >
            Từ năm 2025
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Khám Phá Việt Nam <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
              Vẻ Đẹp Bất Tận
            </span>
          </h1>
          <p className="text-lg md:text-2xl max-w-2xl mx-auto text-slate-200 font-light">
            Chúng tôi kiến tạo những hành trình độc bản, đánh thức mọi giác quan
            và lưu giữ những khoảnh khắc vô giá.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tours">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 h-14 rounded-full"
              >
                Bắt Đầu Hành Trình
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white text-lg px-8 h-14 rounded-full backdrop-blur-sm"
              onClick={() => {
                document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Tìm Hiểu Thêm
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section - Asymmetrical Layout */}
      <section id="story-section" className="py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-foreground">
                  Chúng Tôi Là <span className="text-primary">Visita</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Visita không chỉ là một công ty du lịch. Chúng tôi là những
                  người kể chuyện, những nhà thám hiểm và những người bạn đồng
                  hành tận tâm trên mỗi bước chân của bạn.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Thiết kế lịch trình cá nhân hóa 100%",
                  "Hỗ trợ 24/7 tại mọi điểm đến",
                  "Đối tác độc quyền với các resort 5 sao",
                  "Cam kết du lịch bền vững và có trách nhiệm",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <img
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-background"
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="User"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-foreground">
                      Được tin tưởng bởi 10,000+ du khách
                    </p>
                    <div className="flex text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Tràng An - Ninh Bình"
                  className="rounded-2xl shadow-2xl w-full h-64 object-cover translate-y-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1557750255-c76072a7aad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Chợ nổi Miền Tây"
                  className="rounded-2xl shadow-2xl w-full h-64 object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Parallax feel */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/cubes.png')",
          }}
        ></div>
        <div className="container px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Tỉnh Thành", value: "34", icon: MapPin },
              { label: "Chuyến Đi", value: "1,200+", icon: MapPin },
              { label: "Khách Hàng", value: "10k+", icon: Users },
              { label: "Giải Thưởng", value: "15", icon: Award },
            ].map((stat, index) => (
              <div
                key={index}
                className="space-y-2 p-4 rounded-xl hover:bg-white/5 transition-colors"
              >
                <stat.icon className="w-8 h-8 mx-auto text-blue-400 mb-4" />
                <div className="text-4xl md:text-5xl font-bold">
                  {stat.value}
                </div>
                <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - Cards */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-muted-foreground text-lg">
              Những nguyên tắc định hình nên chất lượng dịch vụ của Visita.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Tận Tâm",
                desc: "Chúng tôi đặt trái tim vào từng chi tiết nhỏ nhất để đảm bảo bạn có một trải nghiệm hoàn hảo.",
                color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
              },
              {
                icon: ShieldCheck,
                title: "Tin Cậy",
                desc: "Minh bạch trong mọi giao dịch, an toàn trong mọi hành trình là cam kết hàng đầu.",
                color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
              },
              {
                icon: Globe,
                title: "Bền Vững",
                desc: "Tôn trọng văn hóa địa phương và bảo vệ môi trường tại mỗi nơi chúng ta đi qua.",
                color: "text-green-500 bg-green-50 dark:bg-green-900/20",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-none shadow-lg hover:-translate-y-2 transition-transform duration-300"
              >
                <CardContent className="p-8 space-y-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} mb-6`}
                  >
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Strip */}
      <section className="py-4 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {[
            "https://images.unsplash.com/photo-1528127269322-539801943592",
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b",
            "https://images.unsplash.com/photo-1557750255-c76072a7aad1",
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            "https://images.unsplash.com/photo-1570366583862-f91883984fde",
          ].map((url, i) => (
            <div
              key={i}
              className="flex-none w-72 md:w-96 aspect-[4/3] rounded-xl overflow-hidden snap-center"
            >
              <img
                src={`${url}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                alt="Việt Nam Gallery"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Team Section - Minimalist */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Gặp Gỡ Đội Ngũ Phát Triển
              </h2>
              <p className="text-muted-foreground text-lg">
                Những lập trình viên tài năng đứng sau nền tảng Visita, mang đến
                trải nghiệm du lịch số tuyệt vời cho bạn.
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                name: "Thắng",
                role: "Backend Developer",
                image: "https://i.pravatar.cc/400?img=11",
              },
              {
                name: "Thành",
                role: "Frontend Developer",
                image: "https://i.pravatar.cc/400?img=12",
              },
              {
                name: "Văn",
                role: "Kiến trúc sư hệ thống",
                image: "https://i.pravatar.cc/400?img=13",
              },
            ].map((member, index) => (
              <div key={index} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted mb-4 relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                      <p className="font-medium">Liên hệ</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-primary font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Large & Bold */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="container px-4 md:px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            Khám Phá Vẻ Đẹp <br /> Việt Nam Cùng Visita
          </h2>
          <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-10">
            Đăng ký ngay hôm nay để nhận ưu đãi 15% cho chuyến đi đầu tiên của
            bạn cùng Visita.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Cảm ơn bạn đã đăng ký!");
            }}
          >
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Nhập email của bạn..."
              className="flex h-12 w-full rounded-full border border-input bg-background px-6 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            />
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              className="rounded-full h-12 px-8 font-bold"
            >
              Đăng Ký
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
