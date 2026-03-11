import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export const ContactInfo = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help from our support team",
      contact: "support@datashield.ai",
      action: "mailto:support@datashield.ai",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our AI assistant",
      contact: "Available 24/7",
      action: "#",
    },
    {
      icon: MapPin,
      title: "Office",
      description: "Visit our headquarters",
      contact: "Mumbai, India",
      action: "#",
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "When we&apos;re available",
      contact: "Mon-Fri 9AM-6PM IST",
      action: "#",
    },
  ];

  return (
    <section id="contact" className="container mx-auto px-4 py-20 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We&apos;re here to help keep you safe online
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan"
            >
              <CardContent className="p-6 text-center">
                <method.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{method.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{method.description}</p>
                <p className="text-primary font-medium">{method.contact}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-primary/20 shadow-glow-cyan">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you&apos;ve encountered a suspicious website or need urgent security assistance,
              our emergency response team is available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Live Chat
              </Button>
              <Button variant="outline" size="lg">
                <Mail className="w-5 h-5 mr-2" />
                Emergency Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
