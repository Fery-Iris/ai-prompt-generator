import { Lightbulb, Wand2, FlaskConical, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "1. The Raw Idea",
    description: "Start with a rough concept or basic instruction. Don't worry about formatting—just define your core objective.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Wand2,
    title: "2. AI Enhancement",
    description: "Our engine analyzes your intent, automatically structuring the prompt with expert techniques like role-assignment and constraints.",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    icon: FlaskConical,
    title: "3. Iterate & Test",
    description: "Preview the generated structure. Tweak variables, adjust the tone, and refine the context until it perfectly fits your needs.",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    icon: CheckCircle,
    title: "4. Final Output",
    description: "Export your highly-optimized, production-ready prompt. Save it to your library for instant, reliable reuse across any LLM.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-normal text-[#111111] mb-4">
            Method
          </h2>
          <p className="text-lg text-[#666666]">
            A comprehensive suite of tools designed to streamline your prompt engineering workflow and boost productivity.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative p-8 rounded-2xl bg-[#fafafa] border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.bgColor} ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#666666] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

