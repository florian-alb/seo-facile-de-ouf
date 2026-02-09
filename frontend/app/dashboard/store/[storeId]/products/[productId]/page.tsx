"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useShopifyProduct } from "@/hooks/use-shopify-product";
import { useShopifyCollections } from "@/hooks/use-shopify-collections";
import { ProductForm, type ProductFormRef } from "@/components/products/product-form";
import { ProductInfoSidebar } from "@/components/products/product-info-sidebar";
import { ActionCard } from "@/components/shared/action-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import type { ProductFormSchema } from "@/lib/validations/product";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const productId = params.productId as string;

  const formRef = useRef<ProductFormRef>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const {
    product,
    isLoading,
    isSaving,
    isPublishing,
    error,
    fetchProduct,
    updateProduct,
    publishProduct,
  } = useShopifyProduct(storeId, productId);

  const { collections, fetchCollections } = useShopifyCollections(storeId);

  useEffect(() => {
    fetchProduct();
    fetchCollections(1, 100);
  }, [storeId, productId]);

  // Handle browser back/forward and tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Intercept link clicks for internal navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && isDirty) {
        const href = link.getAttribute("href");
        if (href && href.startsWith("/") && !href.startsWith("/dashboard/store/" + storeId + "/products/" + productId)) {
          e.preventDefault();
          triggerShake();
          setPendingNavigation(href);
          setShowExitDialog(true);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isDirty, storeId, productId]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const handleSave = async (data: ProductFormSchema) => {
    try {
      await updateProduct({
        title: data.title,
        descriptionHtml: data.descriptionHtml || undefined,
        tags: data.tags,
        imageAlt: data.imageAlt || undefined,
        status: data.status,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
      });
      toast.success("Produit enregistré");
    } catch {
      toast.error("Erreur lors de l'enregistrement du produit");
    }
  };

  const handlePublish = async (data: ProductFormSchema) => {
    try {
      await publishProduct({
        title: data.title,
        descriptionHtml: data.descriptionHtml || undefined,
        tags: data.tags,
        imageAlt: data.imageAlt || undefined,
        status: data.status,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
      });
      toast.success("Produit publié sur Shopify");
    } catch {
      toast.error("Erreur lors de la publication du produit");
    }
  };

  const handleActionSave = () => {
    formRef.current?.submit("save");
  };

  const handleActionPublish = () => {
    formRef.current?.submit("publish");
  };

  const handleActionCancel = () => {
    formRef.current?.reset();
    toast.info("Modifications annulées");
  };

  const handleActionGenerate = () => {
    formRef.current?.generateAll();
  };

  const handleConfirmNavigation = () => {
    setShowExitDialog(false);
    if (pendingNavigation) {
      // Reset form to clear dirty state before navigation
      formRef.current?.reset();
      router.push(pendingNavigation);
    }
  };

  const handleCancelNavigation = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
    triggerShake();
  };

  // Handle back button click with dirty check
  const handleBackClick = (e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      triggerShake();
      setPendingNavigation(`/dashboard/store/${storeId}/products`);
      setShowExitDialog(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/store/${storeId}/products`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Erreur</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchProduct()}>Réessayer</Button>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/store/${storeId}/products`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Produit non trouvé</h1>
        </div>
        <Alert>
          <AlertDescription>
            Le produit demandé n&apos;existe pas ou a été supprimé.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              asChild={!isDirty}
            >
              {isDirty ? (
                <span>
                  <ArrowLeft className="h-4 w-4" />
                </span>
              ) : (
                <Link href={`/dashboard/store/${storeId}/products`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
            </Button>
            <div>
              <h1 className="text-2xl font-bold line-clamp-1">{product.title}</h1>
              <p className="text-sm text-muted-foreground">{product.handle}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column - Form */}
          <div className="lg:col-span-2">
            <ProductForm
              ref={formRef}
              product={product}
              storeId={storeId}
              onSave={handleSave}
              onPublish={handlePublish}
              onDirtyChange={handleDirtyChange}
              isSaving={isSaving}
              isPublishing={isPublishing}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Action Card - Sticky */}
            <ActionCard
              isDirty={isDirty}
              isSaving={isSaving}
              isPublishing={isPublishing}
              onSave={handleActionSave}
              onPublish={handleActionPublish}
              onCancel={handleActionCancel}
              onGenerate={handleActionGenerate}
              shake={shake}
            />

            {/* Product Info */}

            <ProductInfoSidebar product={product} collections={collections} />
          </div>
        </div>
      </div>

      {/* Navigation Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des modifications non enregistrées. Si vous quittez cette
              page, vos modifications seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>
              Rester sur la page
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmNavigation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Quitter sans enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
