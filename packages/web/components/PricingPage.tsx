import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Shield, Zap, Crown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PricingPageProps {
  onBack?: () => void;
}

export const PricingPage = ({ onBack }: PricingPageProps) => {
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "for 7 days",
      description: "Try our service for free",
      features: [
        "Advanced URL scanning and phishing detection",
        "Real-time dashboard and analytics",
        "Browser extension for on-the-fly scanning",
        "API services for integrations",
        "Secure user authentication",
        "Export reports",
        "Scan history management",
      ],
      popular: false,
      icon: Shield,
    },
    {
      name: "Monthly",
      price: "₹449",
      period: "per month",
      description: "Perfect for individual users",
      features: [
        "Advanced URL scanning and phishing detection",
        "Real-time dashboard and analytics",
        "Browser extension for on-the-fly scanning",
        "API services for integrations",
        "Secure user authentication",
        "Export reports",
        "Scan history management",
      ],
      popular: true,
      icon: Zap,
    },
    {
      name: "Yearly",
      price: "₹3,599",
      period: "per year",
      description: "Best value for long-term protection",
      features: [
        "Advanced URL scanning and phishing detection",
        "Real-time dashboard and analytics",
        "Browser extension for on-the-fly scanning",
        "API services for integrations",
        "Secure user authentication",
        "Export reports",
        "Scan history management",
      ],
      popular: false,
      icon: Crown,
    },
  ];

  return (
    <section id="pricing" className="container mx-auto px-4 py-20 bg-card/30">
      <div className="max-w-6xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 group animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        )}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Protection Plan</h2>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade as your security needs grow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-card border-border hover:border-primary/50 transition-all duration-300 ${
                plan.popular ? "border-primary shadow-glow-cyan" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <plan.icon className={`w-12 h-12 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => router.push("/auth/register")}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPage;
