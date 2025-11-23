import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
}

const Payment = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
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
  }, [gameId, user, navigate]);

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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Check if already purchased
      const { data: existingPurchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user!.id)
        .eq("game_id", gameId!)
        .single();

      if (existingPurchase) {
        toast.error("You already own this game!");
        navigate("/dashboard");
        return;
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create purchase record
      const { error } = await supabase.from("purchases").insert({
        user_id: user!.id,
        game_id: gameId!,
        amount: game!.price,
      });

      if (error) throw error;

      toast.success("Purchase successful! Redirecting to your library...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to complete purchase");
    } finally {
      setProcessing(false);
    }
  };

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

  if (!game) return null;

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

          {/* Payment Form */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Payment Details</h1>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Secure Checkout
                </CardTitle>
                <CardDescription>
                  This is a placeholder payment form. No real transactions will be processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        defaultValue="4242 4242 4242 4242"
                        required
                      />
                      <CreditCard className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        defaultValue="12/25"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        defaultValue="123"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      defaultValue="John Doe"
                      required
                    />
                  </div>

                  <Separator className="my-4" />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      `Pay $${game.price.toFixed(2)}`
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By completing this purchase, you agree to our terms of service.
                    This is a demonstration payment form.
                  </p>
                </form>
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
