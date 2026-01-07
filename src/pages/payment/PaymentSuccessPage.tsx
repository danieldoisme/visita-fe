import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

/**
 * Payment Success Page
 * Displayed after successful MoMo/PayPal payment.
 * Communicates success to parent window and auto-closes.
 */
export default function PaymentSuccessPage() {
    useEffect(() => {
        // Notify parent window of successful payment
        if (window.opener) {
            window.opener.postMessage({ type: "PAYMENT_SUCCESS" }, window.location.origin);
            // Auto-close popup after brief delay
            setTimeout(() => window.close(), 2000);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Thanh toán thành công!
                </h1>
                <p className="text-gray-600 mb-4">
                    Cảm ơn bạn đã thanh toán. Đơn đặt tour của bạn đã được xác nhận.
                </p>
                <p className="text-sm text-gray-500">
                    Cửa sổ này sẽ tự động đóng...
                </p>
            </div>
        </div>
    );
}
