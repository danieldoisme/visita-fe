import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import apiClient from "@/api/apiClient";

/**
 * Payment Success Page
 * Displayed after successful MoMo/PayPal payment.
 * Handles PayPal capture if token is present.
 * Communicates success to parent window and auto-closes.
 */
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // PayPal Token
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    const handleCapture = async () => {
      if (!token) {
        // If no token, assume it's MoMo or direct success redirect
        setStatus("success");
        notifyParent();
        return;
      }

      try {
        // Capture PayPal Order
        await apiClient.post(`/api/payment/capture-paypal?token=${token}`);
        setStatus("success");
        notifyParent();
      } catch (error) {
        console.error("Capture failed", error);
        setStatus("error");
      }
    };

    handleCapture();
  }, [token]);

  const notifyParent = () => {
    if (window.opener) {
      window.opener.postMessage(
        { type: "PAYMENT_SUCCESS" },
        window.location.origin
      );
      // Auto-close after 2 seconds
      setTimeout(() => window.close(), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
        {status === "processing" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">
              Đang xử lý thanh toán...
            </h1>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã thanh toán. Đơn đặt tour của bạn đã được xác nhận.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Cửa sổ này sẽ tự động đóng...
            </p>
            <button
              onClick={() => window.close()}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Đóng cửa sổ
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-6">
              Đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng thử lại
              hoặc liên hệ hỗ trợ.
            </p>
            <button
              onClick={() => window.close()}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Đóng cửa sổ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
