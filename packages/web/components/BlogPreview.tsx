import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "The Rise of AI-Powered Phishing Detection",
    excerpt: "Explore how machine learning is revolutionizing cybersecurity and protecting users from sophisticated phishing attacks.",
    date: "2024-01-15",
    readTime: "5 min read",
  },
  {
    title: "Understanding Trust Scores: What Your 0-100 Score Means",
    excerpt: "Learn how our gamified trust scoring system works and what each score range indicates about website safety.",
    date: "2024-01-10",
    readTime: "4 min read",
  },
  {
    title: "Top 10 Phishing Trends of 2024",
    excerpt: "Stay ahead of cybercriminals with our analysis of the latest phishing techniques and how to spot them.",
    date: "2024-01-05",
    readTime: "7 min read",
  },
];

export const BlogPreview = () => {
  return (
    <section id="blog" className="container mx-auto px-4 py-20 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Updates & Insights</h2>
          <p className="text-lg text-muted-foreground">
            Stay informed about cybersecurity trends and DataShield.Ai developments
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {blogPosts.map((post, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="text-xl hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('en-IN')}
                  </div>
                  <span>{post.readTime}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            View All Articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
