import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, ShieldCheck, MessageSquare, ThumbsUp, Loader2, AlertCircle, User } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/products", productId, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  const { data: canReview } = useQuery<{ canReview: boolean; reason?: string }>({
    queryKey: ["/api/products", productId, "can-review"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/products/${productId}/can-review`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) return { canReview: false };
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; title?: string; comment?: string }) => {
      const response = await apiRequest("POST", `/api/products/${productId}/reviews`, reviewData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "can-review"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      setReviewDialogOpen(false);
      setRating(0);
      setTitle("");
      setComment("");
      toast({ title: "Review Submitted", description: "Your review has been submitted for approval." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to submit review", variant: "destructive" });
    },
  });

  const calculateStats = (): ReviewStats => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });
    
    return {
      averageRating: total > 0 ? sum / total : 0,
      totalReviews: total,
      distribution,
    };
  };

  const stats = calculateStats();

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const sizeClass = size === "lg" ? "h-6 w-6" : "h-4 w-4";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
            data-testid={`star-rating-${star}`}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getUserDisplayName = (user?: Review["user"]) => {
    if (!user) return "Anonymous";
    if (user.firstName) {
      return `${user.firstName} ${user.lastName?.charAt(0) || ""}.`.trim();
    }
    return "Customer";
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({ title: "Rating Required", description: "Please select a rating", variant: "destructive" });
      return;
    }
    submitReviewMutation.mutate({ rating, title: title.trim() || undefined, comment: comment.trim() || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold" data-testid="text-reviews-heading">Customer Reviews</h2>
        </div>
        
        {isAuthenticated && canReview?.canReview && (
          <Button onClick={() => setReviewDialogOpen(true)} data-testid="button-write-review">
            <Star className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-foreground" data-testid="text-average-rating">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center my-2">
                {renderStars(Math.round(stats.averageRating), "lg")}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-total-reviews">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{star}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading reviews...
            </div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} data-testid={`review-${review.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{getUserDisplayName(review.user)}</p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          {review.isVerifiedPurchase && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold mt-3">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium text-foreground">No Reviews Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to review this product!
                </p>
                {isAuthenticated && !canReview?.canReview && canReview?.reason && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    {canReview.reason}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Rating *</Label>
              <div className="flex items-center gap-2">
                {renderInteractiveStars()}
                {rating > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewTitle">Review Title (Optional)</Label>
              <Input
                id="reviewTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
                data-testid="input-review-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewComment">Your Review (Optional)</Label>
              <Textarea
                id="reviewComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you liked or didn't like about the product..."
                rows={4}
                maxLength={1000}
                data-testid="input-review-comment"
              />
              <p className="text-xs text-muted-foreground">{comment.length}/1000</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} data-testid="button-cancel-review">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={rating === 0 || submitReviewMutation.isPending}
              data-testid="button-submit-review"
            >
              {submitReviewMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
