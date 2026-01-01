import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
}

// Conversion rate USD to IDR (for display and payment)
const USD_TO_IDR = 15000;

const Payment = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.error("Please log in to make a purchase");
      navigate("/auth");
      return;
    }

    if (!gameId) {
      toast.error("No game selected");
      navigate("/marketplace");
      return;
    }

    fetchGame();
  }, [gameId, user, authLoading, navigate]);

  const fetchGame = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error("Error fetching game:", error);
      toast.error("Failed to load game details");
      navigate("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriceInIDR = (usdPrice: number) => {
    return Math.round(usdPrice * USD_TO_IDR);
  };

  const handlePayment = async () => {
    if (!game || !user) return;

    setProcessingPayment(true);

    try {
      const amountIDR = getPriceInIDR(game.price);

      console.log("Creating DOKU payment...", {
        gameId: game.id,
        amount: amountIDR,
      });

      const { data, error } = await supabase.functions.invoke("create-doku-payment", {
        body: {
          gameId: game.id,
          amount: amountIDR,
          gameTitle: game.title,
          userEmail: user.email,
          userId: user.id,
          callbackUrl: `${window.location.origin}/marketplace`,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to create payment");
      }

      if (!data?.success || !data?.paymentUrl) {
        console.error("Payment creation failed:", data);
        throw new Error(data?.error || "Failed to get payment URL");
      }

      console.log("Payment URL received:", data.paymentUrl);

      // Redirect to DOKU checkout page
      window.location.href = data.paymentUrl;
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process payment");
      setProcessingPayment(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Game not found</p>
            <Button onClick={() => navigate("/marketplace")} className="mt-4">
              Browse Games
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const priceIDR = getPriceInIDR(game.price);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Order Summary</h1>
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4 mb-6">
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{game.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {game.description}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatIDR(priceIDR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatIDR(0)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatIDR(priceIDR)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    ≈ ${game.price.toFixed(2)} USD
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Payment</h1>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Secure Checkout
                </CardTitle>
                <CardDescription>
                  Complete your purchase securely with DOKU
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Available payment methods:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Virtual Account (BCA, Mandiri, BNI, etc.)</li>
                    <li>• Credit/Debit Card</li>
                    <li>• QRIS</li>
                    <li>• E-Wallet (OVO, GoPay, ShopeePay, etc.)</li>
                  </ul>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatIDR(priceIDR)}`
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Payments are processed securely by DOKU</span>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By completing this purchase, you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
