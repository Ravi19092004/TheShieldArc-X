import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How does DataShield.Ai detect phishing sites?",
    answer: "Our AI model analyzes URLs using advanced machine learning techniques, including XGBoost algorithms, IP geolocation, ASN data, and SSL certificate validation to provide a comprehensive trust score.",
  },
  {
    question: "Is the browser extension free?",
    answer: "Yes, the basic version is completely free. We offer premium features for power users who need advanced analytics and reporting.",
  },
  {
    question: "How accurate is the detection?",
    answer: "Our model achieves a 98% detection rate on known phishing sites, with continuous learning to improve accuracy over time.",
  },
  {
    question: "Can I use DataShield.Ai on mobile devices?",
    answer: "Currently, the browser extension is available for desktop browsers. We're working on mobile app versions for iOS and Android.",
  },
  {
    question: "What data do you collect?",
    answer: "We only collect anonymized scan data to improve our AI model. No personal browsing history or sensitive information is stored.",
  },
  {
    question: "How do I get support?",
    answer: "You can reach our support team through the dashboard or email us at support@datashield.ai. Premium users get priority support.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about DataShield.Ai
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <CardTitle className="flex items-center justify-between text-left">
                  {faq.question}
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
              {openIndex === index && (
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
