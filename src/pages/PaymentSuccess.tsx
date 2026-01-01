import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, GamepadIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type PaymentStatus = "loading" | "completed" | "pending" | "failed";

interface PurchaseInfo {
  gameTitle: string;
  amount: number;
  status: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const invoice = searchParams.get("invoice");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!invoice) {
        setStatus("failed");
        return;
      }

      try {
        // Fetch purchase info with game details
        const { data: purchase, error } = await supabase
          .from("purchases")
          .select(`
            *,
            games:game_id (title)
          `)
          .eq("gateway_order_id", invoice)
          .single();

        if (error || !purchase) {
          console.error("Error fetching purchase:", error);
          setStatus("failed");
          return;
        }

        const gameTitle = (purchase.games as { title: string } | null)?.title || "Unknown Game";
        
        setPurchaseInfo({
          gameTitle,
          amount: purchase.amount,
          status: purchase.payment_status,
        });

        if (purchase.payment_status === "completed") {
          setStatus("completed");
        } else if (purchase.payment_status === "failed") {
          setStatus("failed");
        } else {
          // Still pending, poll for updates using edge function as fallback
          setStatus("pending");
          
          // Poll every 5 seconds for up to 60 seconds
          let attempts = 0;
          const maxAttempts = 12;
          
          const pollInterval = setInterval(async () => {
            attempts++;
            console.log(`Polling attempt ${attempts}/${maxAttempts}`);
            
            try {
              // Use edge function to check status (can access service role)
              const { data: statusData, error: statusError } = await supabase.functions.invoke(
                "check-doku-payment-status",
                { body: { invoiceNumber: invoice } }
              );

              if (statusError) {
                console.error("Error checking status via edge function:", statusError);
                // Fallback to direct query
                const { data: updatedPurchase } = await supabase
                  .from("purchases")
                  .select("payment_status")
                  .eq("gateway_order_id", invoice)
                  .single();

                if (updatedPurchase?.payment_status === "completed") {
                  setStatus("completed");
                  setPurchaseInfo(prev => prev ? { ...prev, status: "completed" } : null);
                  clearInterval(pollInterval);
                } else if (updatedPurchase?.payment_status === "failed") {
                  setStatus("failed");
                  clearInterval(pollInterval);
                }
              } else if (statusData?.purchase) {
                const purchaseStatus = statusData.purchase.status;
                
                if (purchaseStatus === "completed") {
                  setStatus("completed");
                  setPurchaseInfo({
                    gameTitle: statusData.purchase.gameTitle,
                    amount: statusData.purchase.amount,
                    status: "completed",
                  });
                  clearInterval(pollInterval);
                } else if (purchaseStatus === "failed") {
                  setStatus("failed");
                  clearInterval(pollInterval);
                }
              }
            } catch (pollError) {
              console.error("Poll error:", pollError);
            }

            if (attempts >= maxAttempts) {
              console.log("Max polling attempts reached, keeping as pending");
              clearInterval(pollInterval);
            }
          }, 5000);

          return () => clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setStatus("failed");
      }
    };

    checkPaymentStatus();
  }, [invoice]);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center"
        >
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Checking Payment Status
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your payment...
              </p>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Payment Processing
              </h1>
              <p className="text-muted-foreground mb-6">
                Your payment is being processed. This may take a moment...
              </p>
              {purchaseInfo && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground">Game</p>
                  <p className="font-semibold text-foreground">{purchaseInfo.gameTitle}</p>
                  <p className="text-sm text-muted-foreground mt-2">Amount</p>
                  <p className="font-semibold text-foreground">{formatIDR(purchaseInfo.amount)}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Invoice: {invoice}
              </p>
            </>
          )}

          {status === "completed" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. Your game is now available in your library.
              </p>
              {purchaseInfo && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground">Game</p>
                  <p className="font-semibold text-foreground">{purchaseInfo.gameTitle}</p>
                  <p className="text-sm text-muted-foreground mt-2">Amount Paid</p>
                  <p className="font-semibold text-green-500">{formatIDR(purchaseInfo.amount)}</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  Go to My Library
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/marketplace")}
                  className="w-full"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6"
              >
                <XCircle className="w-8 h-8 text-red-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Payment Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {invoice 
                  ? "We couldn't process your payment. Please try again."
                  : "Invalid payment reference. Please try again from the marketplace."}
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate("/marketplace")}
                  className="w-full"
                >
                  Return to Marketplace
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/contact")}
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
