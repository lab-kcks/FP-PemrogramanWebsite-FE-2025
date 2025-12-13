import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Play, BookOpen, Users, Sparkles, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const featureColors = [
    "bg-game-pink",
    "bg-game-green", 
    "bg-game-blue",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/20 via-game-yellow/10 to-secondary/20 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-game-pink/30 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-game-yellow/40 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-secondary/30 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-20 right-1/3 w-16 h-16 bg-game-green/30 rounded-full blur-xl animate-float" style={{ animationDelay: "0.5s" }} />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-game-pink text-primary-foreground rounded-full mb-6 shadow-lg">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-bold">Language Learning Games</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-game-pink to-accent bg-clip-text text-transparent">
              Speaking
            </span>
            {" "}
            <span className="bg-gradient-to-r from-secondary via-game-blue to-game-green bg-clip-text text-transparent">
              Cards
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Practice your English speaking skills with interactive conversation cards. 
            Perfect for beginners (A1 level) to build confidence in everyday conversations.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/speaking-cards")}
            className="gap-3 text-lg px-10 py-7 rounded-full shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-game-pink hover:from-primary/90 hover:to-game-pink/90"
          >
            <Play className="h-6 w-6" />
            Start Playing
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: BookOpen, title: "30+ Questions", desc: "A variety of speaking prompts covering everyday topics and situations.", color: featureColors[0] },
            { icon: Users, title: "A1 Beginner Level", desc: "Designed for adult beginners learning English as a second language.", color: featureColors[1] },
            { icon: MessageCircle, title: "Interactive Cards", desc: "Flip cards to reveal questions and practice speaking at your own pace.", color: featureColors[2] },
          ].map((item, index) => (
            <Card 
              key={index} 
              className="p-6 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 bg-card/80 backdrop-blur"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${item.color} flex items-center justify-center shadow-lg`}>
                <item.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </Card>
          ))}
        </div>

        {/* How to Play */}
        <Card className="p-8 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur border-2 border-primary/10 shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="h-6 w-6 text-game-yellow fill-game-yellow" />
            <h2 className="text-2xl font-bold text-foreground">How to Play</h2>
            <Star className="h-6 w-6 text-game-yellow fill-game-yellow" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Start Game", desc: "Click 'Start Playing' to begin", color: "bg-primary" },
              { step: 2, title: "Deal Card", desc: "Tap the card or button to reveal a question", color: "bg-game-pink" },
              { step: 3, title: "Speak Out", desc: "Answer the question out loud in English", color: "bg-secondary" },
              { step: 4, title: "Next Card", desc: "Move to the next card when ready", color: "bg-accent" },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${item.color} text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-6 bg-card/50 backdrop-blur relative z-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Speaking Cards Game • Built for WordIT
            <Sparkles className="h-4 w-4 text-primary" />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
