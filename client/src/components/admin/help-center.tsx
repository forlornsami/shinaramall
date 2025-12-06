import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Phone,
  FileText,
  Video,
  ExternalLink,
  Package,
  ShoppingBag,
  CreditCard,
  Users,
  Settings
} from "lucide-react";
import type { StoreSettings } from "@shared/schema";

const faqItems = [
  {
    question: "How do I add a new product?",
    answer: "Navigate to the Products section from the sidebar, then click the 'Add Product' button. Fill in the product details including name, description, price, category, and images. Click 'Save' to add the product to your catalog.",
    category: "Products",
  },
  {
    question: "How do I process an order?",
    answer: "Go to the Orders section to view all incoming orders. Click on an order to see its details. Update the order status as you process it - from 'Pending' to 'Processing', then 'Shipped', and finally 'Delivered'.",
    category: "Orders",
  },
  {
    question: "How do I set up payment gateways?",
    answer: "Navigate to Payments > Payment Gateways. Click 'Initialize Default' to set up Pakistani payment methods (EasyPaisa, JazzCash, HBL, COD). You can also add custom gateways using the 'Add Gateway' button.",
    category: "Payments",
  },
  {
    question: "How do I manage inventory?",
    answer: "The Inventory section shows all products with their current stock levels. Products with low stock are highlighted. Click on a product to update its stock quantity. You can also enable automatic stock alerts in Settings.",
    category: "Inventory",
  },
  {
    question: "How do I add a new admin user?",
    answer: "Go to Access Control > User Management. Click 'Add User' to create a new admin account. Assign a role to determine their permissions. New admins can only be created by existing admins with the appropriate permissions.",
    category: "Users",
  },
  {
    question: "How do I create custom roles?",
    answer: "Navigate to Access Control > Roles & Permissions. Click 'Add Role' to create a new role. Define the role name and select the permissions you want to grant. You can edit or delete roles at any time.",
    category: "Users",
  },
  {
    question: "What payment methods are supported?",
    answer: "Eshaal Store supports popular Pakistani payment methods including EasyPaisa, JazzCash, HBL Bank Transfer, and Cash on Delivery (COD). You can enable or disable any payment method from the Payments section.",
    category: "Payments",
  },
  {
    question: "How do I track sales and revenue?",
    answer: "The Dashboard shows key metrics including total orders, revenue, and product statistics. For detailed payment analytics, visit the Payments section where you can see transaction history and gateway performance.",
    category: "Analytics",
  },
];

const quickLinks = [
  { title: "Product Management Guide", icon: Package, color: "from-purple-500 to-purple-600" },
  { title: "Order Processing Tutorial", icon: ShoppingBag, color: "from-orange-500 to-orange-600" },
  { title: "Payment Setup Guide", icon: CreditCard, color: "from-green-500 to-green-600" },
  { title: "User Roles & Permissions", icon: Users, color: "from-blue-500 to-blue-600" },
];

export default function HelpCenterSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="section-help">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Help Center
          </h2>
          <p className="text-muted-foreground">Find answers and get support for Eshaal Store</p>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-help-search"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-shadow group"
            data-testid={`card-quick-link-${index}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{link.title}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          <span>{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for "{searchQuery}". Try a different search term.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Need more help? Reach out to us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email Support</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-admin-help-email">
                    {storeSettings?.storeEmail || "support@eshaalstore.pk"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Phone Support</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-admin-help-phone">
                    {storeSettings?.storePhone || "+92 300 1234567"}
                  </p>
                </div>
              </div>
              <Button className="w-full" data-testid="button-contact-support">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start a Conversation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Badge variant="secondary">5 min</Badge>
                <span className="text-sm flex-1">Getting Started with Eshaal Store</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Badge variant="secondary">8 min</Badge>
                <span className="text-sm flex-1">Managing Your Products</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Badge variant="secondary">6 min</Badge>
                <span className="text-sm flex-1">Processing Orders</span>
              </div>
              <Button variant="outline" className="w-full" data-testid="button-view-all-tutorials">
                View All Tutorials
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access comprehensive documentation for all features and integrations.
              </p>
              <Button variant="outline" className="w-full" data-testid="button-view-docs">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
