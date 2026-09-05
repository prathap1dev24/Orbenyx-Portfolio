"use client";

import {
  ClaudeAI,
  Cursor,
  Gemini,
  Github,
  OpenAI,
  Replicate,
} from "@aliimam/logos";
import { Check } from "@aliimam/icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const Bookademo3 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mt-6 grid w-full lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-md text-muted-foreground font-light">
              <span className="cursor-pointer hover:underline">Contact</span> /
              Design Consultation
            </h1>
            <h2 className="w-full text-5xl tracking-tighter">
              Let&apos;s Design Together
            </h2>
            <div className="">
              <div className="mb-6 space-y-6 lg:flex lg:flex-col">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="bg-secondary text-primary h-6 w-6 rounded-full p-1.5" />
                    <p className="text-sm">
                      Share your design vision and project goals
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="bg-secondary text-primary h-6 w-6 rounded-full p-1.5" />
                    <p className="text-sm">Experience a tailored design demo</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="bg-secondary text-primary h-6 w-6 rounded-full p-1.5" />
                    <p className="text-sm">Discover premium design solutions</p>
                  </div>
                </div>
                <p className="font-semibold">
                  Trusted by +10,000 designers and creatives
                </p>
                <div className="grid h-full max-w-sm grid-cols-2 gap-x-12 -space-y-6 pr-20 md:max-w-lg md:grid-cols-3">
                  <OpenAI type="wordmark" size={100} />
                  <ClaudeAI type="wordmark" size={100} />
                  <Replicate type="wordmark" size={100} />
                  <Cursor type="wordmark" size={100} />
                  <Gemini type="wordmark" size={90} />
                  <Github type="wordmark" size={90} />
                </div>
              </div>
            </div>
          </div>
          <form className="space-y-8 border p-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="Your Name"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label>Work Email</Label>
                <Input
                  type="text"
                  placeholder="contact@aliimam.in"
                  className="mt-2"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Project Details (Optional)</Label>
              <Textarea
                placeholder="Tell us about your design project..."
                className="mt-4 h-24"
              />
            </div>
            <div>
              <Label>How Did You Hear About Us? (Optional)</Label>
              <Textarea
                placeholder="Share where you found us..."
                className="mt-4 [resize:none]"
              />
            </div>
            <Button>Connect with Our Design Team</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export { Bookademo3 };
