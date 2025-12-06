import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Send,
  Server,
  Code2,
  Shield,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { apiClient } from "@/lib/axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(20, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(20, "Last name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email")
    .max(255, "Email is too long"),
  company: z.string().max(100, "Company name is too long").optional(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);

    try {
      await apiClient.post("/form", {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        company_name: data.company || null,
        message: data.message,
      });

      setIsSuccess(true);
      form.reset();
    } catch {
      setSubmitError("Failed to send message. Please try again.");
    }
  };

  const helpTopics = [
    {
      icon: <Server className="w-5 h-5" />,
      title: "Custom Deployments",
      description:
        "Dedicated instances tailored to your scale and requirements",
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "Technical Integration",
      description: "API setup, SDK guidance, and architecture consultation",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Enterprise Security",
      description: "SSO, audit logs, compliance, and data governance",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Pricing & Plans",
      description: "Volume discounts, custom plans, and billing questions",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left Side - Info */}
            <div className="space-y-10 lg:sticky lg:top-32">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                  Let's discuss your
                  <span className="block mt-1 bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    AI infrastructure
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  Whether you're looking for custom pricing, have technical
                  questions, or want to explore enterprise features. We're here
                  to help.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  What we can help with
                </p>
                <div className="grid gap-4">
                  {helpTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        {topic.icon}
                      </div>
                      <div>
                        <p className="text-foreground font-medium mb-0.5">
                          {topic.title}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-8 sm:p-10 shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative space-y-8">
                  {isSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        Message sent!
                      </h2>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We'll get back to you
                        shortly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsSuccess(false)}
                        className="text-primary hover:underline text-sm"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground mb-2">
                          Send us a message
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Fill out the form below and we'll get back to you
                          shortly.
                        </p>
                      </div>

                      {submitError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                          {submitError}
                        </div>
                      )}

                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6"
                        >
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    First name{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="First" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Last name{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="Last" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Work email{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="example@company.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Company name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Message{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your project or requirements..."
                                    className="min-h-[120px] resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            size="lg"
                            disabled={form.formState.isSubmitting}
                            className="w-full py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                          >
                            {form.formState.isSubmitting ? (
                              <>
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                Send Message
                                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </Button>

                          <p className="text-xs text-muted-foreground text-center">
                            By submitting, you agree to our{" "}
                            <a
                              href="/privacy"
                              className="text-primary hover:underline"
                            >
                              Privacy Policy
                            </a>
                          </p>
                        </form>
                      </Form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
