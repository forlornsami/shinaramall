import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryThumbnail } from "@/lib/utils";
import type { Category, StoreSettings } from "@shared/schema";
import { Grid3X3, ChevronRight, Tag } from "lucide-react";
import type { StorefrontSection } from "./StorefrontSidebar";

const categoryGradients = [
  "from-pink-500/80 to-rose-600/80",
  "from-blue-500/80 to-indigo-600/80",
  "from-amber-500/80 to-orange-600/80",
  "from-green-500/80 to-emerald-600/80",
  "from-purple-500/80 to-violet-600/80",
  "from-cyan-500/80 to-teal-600/80",
];

interface CategoriesViewProps {
  onCategorySelect: (section: StorefrontSection) => void;
}

export default function CategoriesView({ onCategorySelect }: CategoriesViewProps) {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
          <Grid3X3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-categories-title">
            Shop by Category
          </h2>
          <p className="text-sm text-muted-foreground">Browse our wide range of product categories</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.id}
              className="card-modern border-0 overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300"
              onClick={() => onCategorySelect(`category-${category.id}` as StorefrontSection)}
              data-testid={`card-category-${category.id}`}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={getCategoryThumbnail(category, storeSettings?.defaultCategoryImage)} 
                  alt={category.name} 
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${categoryGradients[index % categoryGradients.length]} opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                
                {category.isFeatured && (
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {category.description || `Explore ${category.name} products`}
                </p>
                <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                  <span>Browse Products</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No categories yet</h3>
          <p className="text-muted-foreground">Check back soon for new product categories!</p>
        </div>
      )}
    </div>
  );
}
