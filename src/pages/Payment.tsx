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
      HostedButtons: (config: { hostedButtonId: string }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

const PAYPAL_HOSTED_BUTTON_ID = "56M44P459SACY";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalScriptLoaded = useRef(false);

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

    // Already present?
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-paypal-hosted-buttons="true"]'
    );
    if (existing) {
      setPaypalLoaded(true);
      renderPayPalButton();
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-paypal-hosted-buttons", "true");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=BAAn9BhNr-uImomksJySHcj67NkefF2WE4YDDKXqWNSf2AJ04V0Vy-uGsqwzBAJS7sBPtXhGvqqChT_Daw&components=hosted-buttons&disable-funding=venmo&currency=USD";
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
      renderPayPalButton();
    };
    script.onerror = () => {
      console.error("Failed to load PayPal SDK");
      setPaypalError("PayPal SDK failed to load");
      toast.error("Failed to load payment system");
    };
    document.head.appendChild(script);
  };

  const waitForHostedButtons = (retries = 25) => {
    return new Promise<boolean>((resolve) => {
      const check = (remaining: number) => {
        const ok =
          !!window.paypal && typeof window.paypal.HostedButtons === "function";

        if (ok) return resolve(true);
        if (remaining <= 0) return resolve(false);

        setTimeout(() => check(remaining - 1), 150);
      };

      check(retries);
    });
  };

  const renderPayPalButton = async () => {
    if (!paypalContainerRef.current) return;

    // Clear any existing content
    paypalContainerRef.current.innerHTML = "";

    try {
      const ok =
        !!window.paypal && typeof window.paypal.HostedButtons === "function";

      if (!ok) {
        const ready = await waitForHostedButtons();
        if (!ready) {
          throw new Error(
            "PayPal HostedButtons is not available (SDK may be blocked by browser/extensions)."
          );
        }
      }

      // At this point it should exist - await the render promise
      await window.paypal!.HostedButtons({
        hostedButtonId: PAYPAL_HOSTED_BUTTON_ID,
      }).render(`#paypal-container-${PAYPAL_HOSTED_BUTTON_ID}`);
    } catch (err) {
      console.error("PayPal Hosted Button render error:", err);
      setPaypalError("Unable to render PayPal button");
      toast.error("Unable to load PayPal button");
    }
  };

  useEffect(() => {
    if (paypalLoaded && game) {
      renderPayPalButton();
    }
  }, [paypalLoaded, game]);

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
                {paypalError ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <p className="font-medium">Payment temporarily unavailable</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {paypalError}. Please disable ad-blockers for PayPal or try another browser.
                    </p>
                  </div>
                ) : (
                  <div
                    id={`paypal-container-${PAYPAL_HOSTED_BUTTON_ID}`}
                    ref={paypalContainerRef}
                  >
                    {!paypalLoaded && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <span className="text-muted-foreground">
                          Loading payment options...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Payments are processed securely by PayPal</span>
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
