import { useEffect } from "react";
import { XCircle } from "lucide-react";

/**
 * Payment Cancel Page
 * Displayed when user cancels or payment fails at MoMo/PayPal.
 * Communicates cancellation to parent window and auto-closes.
 */
export default function PaymentCancelPage() {
    useEffect(() => {
        // Notify parent window of cancelled payment
        if (window.opener) {
            window.opener.postMessage({ type: "PAYMENT_CANCEL" }, window.location.origin);
            // Auto-close popup after brief delay
            setTimeout(() => window.close(), 3000);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Thanh toán bị hủy
                </h1>
                <p className="text-gray-600 mb-4">
                    Giao dịch thanh toán đã bị hủy hoặc thất bại. Bạn có thể thử lại sau.
                </p>
                <p className="text-sm text-gray-500">
                    Cửa sổ này sẽ tự động đóng...
                </p>
            </div>
        </div>
    );
}
