import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactFormSchema, ContactFormData } from "@/lib/validation";
import { useContact } from "@/context/ContactContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    Loader2,
    MessageSquare,
    Facebook,
    Instagram,
} from "lucide-react";

// Company contact information
const COMPANY_INFO = {
    phone: "1900-1234",
    phoneHours: "24/7",
    email: "support@visita.vn",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    hours: "T2 - T7: 8:00 - 18:00, CN: 9:00 - 15:00",
    socials: {
        facebook: "https://facebook.com/visita",
        instagram: "https://instagram.com/visita",
    },
};

export default function ContactPage() {
    const { submitContactRequest } = useContact();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: user?.fullName || "",
            email: user?.email || "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        try {
            await submitContactRequest({
                ...data,
                type: "general",
            });

            form.reset({
                name: user?.fullName || "",
                email: user?.email || "",
                subject: "",
                message: "",
            });

            toast.success("Đã gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");
        } catch {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <div className="container py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Liên hệ với chúng tôi
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Bạn có câu hỏi về tour du lịch? Đội ngũ tư vấn của Visita luôn sẵn sàng hỗ trợ bạn 24/7.
                    </p>
                </div>
            </div>

            <div className="container py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Phone */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">
                                            Hotline
                                        </h3>
                                        <a
                                            href={`tel:${COMPANY_INFO.phone.replace(/-/g, "")}`}
                                            className="text-2xl font-bold text-primary hover:underline"
                                        >
                                            {COMPANY_INFO.phone}
                                        </a>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Hỗ trợ {COMPANY_INFO.phoneHours}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Email */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">
                                            Email
                                        </h3>
                                        <a
                                            href={`mailto:${COMPANY_INFO.email}`}
                                            className="text-lg font-medium text-green-600 hover:underline"
                                        >
                                            {COMPANY_INFO.email}
                                        </a>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Phản hồi trong 24 giờ
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">
                                            Văn phòng
                                        </h3>
                                        <p className="text-slate-600">
                                            {COMPANY_INFO.address}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hours */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">
                                            Giờ làm việc
                                        </h3>
                                        <p className="text-slate-600">
                                            {COMPANY_INFO.hours}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Media */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">
                                    Kết nối với chúng tôi
                                </h3>
                                <div className="flex gap-3">
                                    <a
                                        href={COMPANY_INFO.socials.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                        aria-label="Facebook"
                                    >
                                        <Facebook className="w-6 h-6 text-blue-600" />
                                    </a>
                                    <a
                                        href={COMPANY_INFO.socials.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="w-6 h-6 text-pink-600" />
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Send className="w-5 h-5" />
                                    Gửi tin nhắn cho chúng tôi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* Name field */}
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Họ và tên</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Nhập họ và tên"
                                                                autoComplete="name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Email field */}
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder="Nhập email"
                                                                autoComplete="email"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Subject field */}
                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tiêu đề</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nhập tiêu đề tin nhắn"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Message field */}
                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nội dung</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Nhập nội dung tin nhắn của bạn..."
                                                            rows={6}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Submit Button */}
                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full md:w-auto"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Đang gửi...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Gửi tin nhắn
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
