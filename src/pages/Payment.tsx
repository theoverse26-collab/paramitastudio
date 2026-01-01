import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Lock, ShieldCheck } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          layout?: string;
          color?: string;
          shape?: string;
          label?: string;
        };
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: Error) => void;
        onCancel: () => void;
      }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

const PAYPAL_CLIENT_ID = "AZwV5QLC8OLOfyvBt4R2hglbQ1fwEsGg60aMQGFCaX7f2EFsc04q5OQnTcUOGBvlxkMYpk-6PMafsgxv";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const paypalButtonsRef = useRef<HTMLDivElement>(null);
  const paypalScriptLoaded = useRef(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
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

  useEffect(() => {
    if (game && !paypalScriptLoaded.current) {
      loadPayPalScript();
    }
  }, [game]);

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

  const loadPayPalScript = () => {
    if (paypalScriptLoaded.current) return;
    paypalScriptLoaded.current = true;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
      renderPayPalButtons();
    };
    script.onerror = () => {
      console.error("Failed to load PayPal SDK");
      toast.error("Failed to load payment system");
    };
    document.body.appendChild(script);
  };

  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalButtonsRef.current || !game || !user) return;

    // Clear any existing buttons
    paypalButtonsRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
      createOrder: async () => {
        setProcessing(true);
        try {
          const response = await supabase.functions.invoke("create-paypal-order", {
            body: {
              gameId: game.id,
              gameTitle: game.title,
              amount: game.price,
              userId: user.id,
            },
          });

          if (response.error) {
            throw new Error(response.error.message || "Failed to create order");
          }

          const { orderId } = response.data;
          if (!orderId) {
            throw new Error("No order ID received");
          }

          return orderId;
        } catch (error: any) {
          console.error("Create order error:", error);
          toast.error(error.message || "Failed to create PayPal order");
          setProcessing(false);
          throw error;
        }
      },
      onApprove: async (data) => {
        try {
          const response = await supabase.functions.invoke("capture-paypal-order", {
            body: {
              orderId: data.orderID,
              userId: user.id,
              gameId: game.id,
              amount: game.price,
            },
          });

          if (response.error) {
            throw new Error(response.error.message || "Failed to capture payment");
          }

          if (response.data.error) {
            throw new Error(response.data.error);
          }

          toast.success("Payment successful! Redirecting to your library...");
          setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error: any) {
          console.error("Capture error:", error);
          toast.error(error.message || "Failed to complete payment");
        } finally {
          setProcessing(false);
        }
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        toast.error("Payment failed. Please try again.");
        setProcessing(false);
      },
      onCancel: () => {
        toast.info("Payment cancelled");
        setProcessing(false);
      },
    }).render("#paypal-button-container");
  };

  useEffect(() => {
    if (paypalLoaded && game && user) {
      renderPayPalButtons();
    }
  }, [paypalLoaded, game, user]);

  if (loading) {
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
                    <span>${game.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$0.00</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">${game.price.toFixed(2)}</span>
                  </div>
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
                  Complete your purchase securely with PayPal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {processing && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                    <span className="text-muted-foreground">Processing payment...</span>
                  </div>
                )}
                
                <div 
                  id="paypal-button-container" 
                  ref={paypalButtonsRef}
                  className={processing ? "opacity-50 pointer-events-none" : ""}
                >
                  {!paypalLoaded && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                      <span className="text-muted-foreground">Loading payment options...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Payments are processed securely by PayPal</span>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By completing this purchase, you agree to our terms of service.
                  <br />
                  <span className="text-yellow-600 font-medium">Sandbox Mode: Use PayPal test credentials</span>
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
