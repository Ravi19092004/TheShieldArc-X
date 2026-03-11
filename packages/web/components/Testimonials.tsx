import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "DataShield.Ai has saved me from multiple phishing attempts. The real-time protection is incredible!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "IT Professional",
    content: "The AI model is impressive. It caught a sophisticated phishing site that other tools missed.",
    rating: 5,
  },
  {
    name: "Emily Davis",
    role: "Freelancer",
    content: "Easy to use and highly effective. I feel much safer browsing now.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="container mx-auto px-4 py-20 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground">
            Trusted by thousands of users worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan"
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">&quot;{testimonial.content}&quot;</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
