import { Card, CardContent } from "@/components/ui/card";
import { Github, Linkedin } from "lucide-react";

export const TeamSection = () => {
  const team = [
    {
      name: "Ravishankar Gharabidi",
      role: "Project Lead, Btech CSE AI Specialization Student",
      bio: "Ravishankar Gharabidi focused on developing the frontend of the application using Next.js and Tailwind CSS. worked on the frontend development and browser extension, designing and implementing the Next.js user interface and building the browser extension for real-time phishing detection.",
      image: "/avatars/team/ravishankar.jpg",
      social: {
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Aryan Kumar",
      role: "Btech CSE AI Specialization Student",
      bio: " Aryan Kumar was responsible for handling user authentication and database management. This included implementing secure user authentication mechanisms, managing user access control, designing and maintaining the database schema using Neon PostgreSQL, and integrating database operations through Prisma ORM.",
      image: "/avatars/team/aryan.jpg",
      social: {
        linkedin: "#",
        github: "#",
      },
    },
  ];

  return (
    <section id="team" className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Expert Team</h2>
          <p className="text-lg text-muted-foreground">
            World-class cybersecurity professionals dedicated to keeping you safe
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan text-center"
            >
              <CardContent className="p-6">
                <div className={`w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center ${index < 2 ? 'animate-pulse-scale' : ''}`}>
                  {/* Placeholder avatar */}
                  <div className={`w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center ${index < 2 ? 'animate-pulse-scale' : ''}`}>
                    <span className="text-xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>

                <div className="flex justify-center gap-3">
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.github && (
                    <a href={member.social.github} className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Our team of passionate AI students is dedicated to creating innovative cybersecurity solutions
            that protect users from evolving digital threats.
          </p>
        </div>
      </div>
    </section>
  );
};
