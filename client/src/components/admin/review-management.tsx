import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Check, X, Trash2, Eye, ShieldCheck, Clock, MessageSquare, Package } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNote?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
  };
}

export default function ReviewManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews", activeTab !== "all" ? activeTab : undefined],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const url = activeTab !== "all" 
        ? `/api/admin/reviews?status=${activeTab}` 
        : "/api/admin/reviews";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  const { data: pendingCount } = useQuery<{ count: number }>({
    queryKey: ["/api/admin/reviews/pending-count"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/reviews/pending-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch pending count");
      return response.json();
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/reviews/${id}/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });
      if (!response.ok) throw new Error("Failed to moderate review");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/pending-count"] });
      setSelectedReview(null);
      setModerationNote("");
      setViewDialogOpen(false);
      toast({ title: "Success", description: "Review moderated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to moderate review", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete review");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/pending-count"] });
      toast({ title: "Success", description: "Review deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete review", variant: "destructive" });
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getUserDisplayName = (user?: Review["user"]) => {
    if (!user) return "Unknown User";
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ""}`.trim();
    }
    return user.email.split("@")[0];
  };

  const openViewDialog = (review: Review) => {
    setSelectedReview(review);
    setModerationNote(review.moderationNote || "");
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-reviews-title">Review Moderation</h2>
          <p className="text-muted-foreground">Approve, reject, or manage customer product reviews</p>
        </div>
        {pendingCount && pendingCount.count > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1" data-testid="badge-pending-count">
            {pendingCount.count} pending
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2" data-testid="tab-pending">
            <Clock className="h-4 w-4" />
            Pending
            {pendingCount && pendingCount.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5">{pendingCount.count}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2" data-testid="tab-approved">
            <Check className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2" data-testid="tab-rejected">
            <X className="h-4 w-4" />
            Rejected
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2" data-testid="tab-all">
            <MessageSquare className="h-4 w-4" />
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                {activeTab === "all" ? "All Reviews" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reviews`}
              </CardTitle>
              <CardDescription>
                {reviews?.length || 0} reviews found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
              ) : reviews?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reviews found in this category.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews?.map((review) => (
                      <TableRow key={review.id} data-testid={`row-review-${review.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium max-w-[150px] truncate">
                              {review.product?.name || "Unknown Product"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getUserDisplayName(review.user)}</p>
                            {review.isVerifiedPurchase && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <ShieldCheck className="h-3 w-3" />
                                Verified Purchase
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{renderStars(review.rating)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {review.title && <p className="font-medium truncate">{review.title}</p>}
                            {review.comment && (
                              <p className="text-sm text-muted-foreground truncate">{review.comment}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openViewDialog(review)}
                              data-testid={`button-view-${review.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {review.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => moderateMutation.mutate({ id: review.id, status: "approved" })}
                                  data-testid={`button-approve-${review.id}`}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => moderateMutation.mutate({ id: review.id, status: "rejected" })}
                                  data-testid={`button-reject-${review.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setReviewToDelete(review.id); setDeleteConfirmOpen(true); }}
                              data-testid={`button-delete-${review.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              View and moderate this product review
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{selectedReview.product?.name || "Unknown Product"}</p>
                </div>
                {getStatusBadge(selectedReview.status)}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{getUserDisplayName(selectedReview.user)}</p>
                  {selectedReview.isVerifiedPurchase && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>

              {selectedReview.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
              )}

              {selectedReview.comment && (
                <div>
                  <p className="text-sm text-muted-foreground">Comment</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedReview.comment}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p>{format(new Date(selectedReview.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
              </div>

              {selectedReview.status === "pending" && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="moderationNote">Moderation Note (Optional)</Label>
                  <Textarea
                    id="moderationNote"
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    placeholder="Add an internal note about this moderation decision..."
                    rows={2}
                    data-testid="input-moderation-note"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} data-testid="button-close">
              Close
            </Button>
            {selectedReview?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    moderateMutation.mutate({
                      id: selectedReview.id,
                      status: "rejected",
                      note: moderationNote || undefined,
                    });
                  }}
                  disabled={moderateMutation.isPending}
                  data-testid="button-reject-dialog"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    moderateMutation.mutate({
                      id: selectedReview.id,
                      status: "approved",
                      note: moderationNote || undefined,
                    });
                  }}
                  disabled={moderateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-approve-dialog"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the review and update the product's rating.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reviewToDelete) {
                  deleteMutation.mutate(reviewToDelete);
                }
                setDeleteConfirmOpen(false);
                setReviewToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
