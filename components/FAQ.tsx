"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is AI Prompt Generator all about?",
    answer: "AI Prompt Generator is a tool designed to help you craft, refine, and test the perfect prompts for any AI model.",
  },
  {
    question: "Who can benefit from this platform?",
    answer: "Anyone who uses AI—from developers and prompt engineers to writers and marketers—can benefit from perfectly structured prompts.",
  },
  {
    question: "Are you planning to open source the consensus engine?",
    answer: "We are currently evaluating open-source opportunities for our core engine in the future.",
  },
  {
    question: "How can I make sure to avoid bad outputs when using LLMs?",
    answer: "By using our structured prompt methods, you can provide the AI with the right context, constraints, and roles to ensure high-quality outputs.",
  },
  {
    question: "Is AI Prompt Generator GDPR compliant?",
    answer: "Yes, we adhere to GDPR guidelines and ensure your data is processed securely and privately.",
  },
  {
    question: "Can I have more information about data ownership?",
    answer: "You own all the prompts you generate. We do not use your private workspace data to train our AI models.",
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full flex flex-col font-sans">
      {/* Top Dark Section */}
      <div className="bg-[#05051a] w-full py-32 flex items-center justify-center">
        <h2 className="text-6xl sm:text-[5rem] font-normal text-white tracking-tight">
          FAQ
        </h2>
      </div>

      {/* Bottom White Section */}
      <div className="bg-white w-full py-16 sm:py-24">
        <div className="max-w-[50rem] mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="border border-[#e2e8f0] rounded-md bg-white transition-all duration-200"
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-slate-50 transition-colors rounded-md"
                  >
                    <span className="text-[0.9375rem] font-normal text-[#111111]">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-[#94a3b8] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                    />
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 text-[#666666] text-[0.9375rem] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
