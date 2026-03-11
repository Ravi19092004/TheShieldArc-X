import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

export const VideoDemo = () => {
  return (
    <section id="demo" className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See DataShield.Ai in Action</h2>
          <p className="text-lg text-muted-foreground">
            Watch how our AI-powered extension protects you from phishing attacks in real-time
          </p>
        </div>

        <Card className="bg-card border-primary/20 shadow-glow-cyan overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {/* Placeholder for video - replace with actual video embed */}
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-primary ml-1" />
                </div>
                <h3 className="text-xl font-semibold mb-2">DataShield.Ai Demo Video</h3>
                <p className="text-muted-foreground">Coming Soon - Real-time phishing detection walkthrough</p>
              </div>

              {/* Video overlay/play button */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">Hover Detection</h3>
            <p className="text-sm text-muted-foreground">
              See trust scores instantly when hovering over links
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Real-Time Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI analyzes URLs before you click
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Automatic Blocking</h3>
            <p className="text-sm text-muted-foreground">
              Dangerous sites are automatically blocked
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
