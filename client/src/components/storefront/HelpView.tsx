import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { StoreSettings } from "@shared/schema";
import {
  HelpCircle,
  Search,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Truck,
  CreditCard,
  ShieldCheck,
  Package,
  RotateCcw,
  HeadphonesIcon,
} from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    category: "Orders & Shipping",
    icon: Truck,
    questions: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3-5 business days within major cities in Pakistan. For remote areas, it may take 5-7 business days."
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free shipping on all orders above Rs. 5,000. For orders below this amount, a flat shipping fee of Rs. 200 applies."
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your order is shipped, you will receive a tracking number via email and SMS. You can track your package in the 'My Orders' section."
      },
    ]
  },
  {
    category: "Payments",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept EasyPaisa, JazzCash, HBL bank transfer, and Cash on Delivery (COD). All online payments are secured with bank-level encryption."
      },
      {
        q: "Is Cash on Delivery available in my area?",
        a: "Cash on Delivery is available in all major cities across Pakistan. For remote areas, please check with our support team."
      },
      {
        q: "When is my payment charged?",
        a: "For online payments, the amount is charged immediately. For COD, you pay when the order is delivered to your doorstep."
      },
    ]
  },
  {
    category: "Returns & Refunds",
    icon: RotateCcw,
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return policy for most items. Products must be unused, in original packaging, with all tags attached."
      },
      {
        q: "How do I initiate a return?",
        a: "Contact our support team with your order number. We'll arrange for pickup and process your refund within 5-7 business days."
      },
      {
        q: "Are there any non-returnable items?",
        a: "Personal care items, undergarments, and customized products cannot be returned for hygiene and personalization reasons."
      },
    ]
  },
  {
    category: "Account & Security",
    icon: ShieldCheck,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign In' button and register with your email address. Your account will be created automatically."
      },
      {
        q: "Is my personal information secure?",
        a: "Yes, we use industry-standard encryption to protect your data. We never share your personal information with third parties."
      },
      {
        q: "How do I update my profile?",
        a: "Go to 'My Account' section in the sidebar, click 'Edit Profile', make your changes, and click 'Save'."
      },
    ]
  },
];

const quickHelpItems = [
  { icon: Package, label: "Track Order", description: "Check your order status" },
  { icon: RotateCcw, label: "Returns", description: "Start a return request" },
  { icon: CreditCard, label: "Payment Issues", description: "Resolve payment problems" },
  { icon: HeadphonesIcon, label: "Contact Us", description: "Get personalized help" },
];

export default function HelpView() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-help-title">
            Help & Support
          </h2>
          <p className="text-sm text-muted-foreground">Find answers or get in touch</p>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl border-border/50"
          data-testid="input-search-help"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickHelpItems.map((item) => (
          <Card
            key={item.label}
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{item.label}</h4>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No matching questions found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFaqs.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.category}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-foreground">{category.category}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {category.questions.length}
                          </Badge>
                        </div>
                        <Accordion type="single" collapsible className="space-y-2">
                          {category.questions.map((faq, index) => (
                            <AccordionItem
                              key={index}
                              value={`${category.category}-${index}`}
                              className="border rounded-xl px-4"
                            >
                              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                                {faq.q}
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-muted-foreground pb-4">
                                {faq.a}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-help-email">
                    {storeSettings?.storeEmail || "support@eshaalstore.pk"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-help-phone">
                    {storeSettings?.storePhone || "+92 300 1234567"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-help-address">
                    {storeSettings?.storeAddress || "Lahore, Pakistan"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">Mon - Sat: 9AM - 8PM</p>
                </div>
              </div>

              <Button className="w-full btn-modern rounded-xl mt-4" data-testid="button-send-message">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
