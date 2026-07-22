"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { cn } from "@/lib/utils";
import { Check, Copy, Sparkles, RotateCcw, MoreHorizontal, Pencil, Image as ImageIcon, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator as DialogSeparator } from "@/components/ui/separator";
import { WorkspaceSkeleton } from "@/components/skeletons/workspace-skeleton";
import { useSkeletonLoading } from "@/hooks/use-skeleton-loading";

interface Campaign {
  id: string;
  title: string;
  brandId: string;
  productDescription: string;
  brandProfile?: string;
  platforms: { id: string; name: string; enabled: boolean }[];
  status: "draft" | "generating" | "completed" | "failed";
  assets?: GeneratedAsset[];
  createdAt: Date;
}

interface GeneratedAsset {
  id: string;
  platformId: string;
  platformName: string;
  type: "post" | "story" | "reel" | "carousel";
  text: string;
  imageUrl?: string;
}

interface WorkspacePageProps {
  user?: {
    name: string;
    email: string;
    initials: string;
    plan: "FREE" | "PRO";
  };
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "campaign-1",
    title: "Summer Sale 2025",
    brandId: "brand-1",
    productDescription: "Summer collection with 40% off on all clothing items",
    platforms: [
      { id: "instagram", name: "Instagram", enabled: true },
      { id: "facebook", name: "Facebook", enabled: true },
      { id: "linkedin", name: "LinkedIn", enabled: true },
    ],
    status: "completed",
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "campaign-2",
    title: "Product Launch",
    brandId: "brand-2",
    productDescription: "New organic skincare line made with natural ingredients",
    platforms: [
      { id: "instagram", name: "Instagram", enabled: true },
      { id: "linkedin", name: "LinkedIn", enabled: true },
    ],
    status: "completed",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "campaign-3",
    title: "Holiday Campaign",
    brandId: "brand-1",
    productDescription: "Gift bundles with free shipping",
    platforms: [
      { id: "facebook", name: "Facebook", enabled: true },
      { id: "x", name: "X (Twitter)", enabled: true },
    ],
    status: "draft",
    createdAt: new Date(),
  },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
};

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    borderColor: "border-pink-500/30",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    className: "bg-pink-50 text-pink-600 border-pink-200",
  },
  {
    id: "facebook",
    name: "Facebook",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    borderColor: "border-blue-700/30",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "x",
    name: "X (Twitter)",
    borderColor: "border-ink/30",
    bgColor: "bg-ink/5",
    textColor: "text-ink",
    className: "bg-ink/5 text-ink border-ink/20",
  },
];

function generateCopyForPlatform(platformId: string, description: string): string {
  const copies: Record<string, string[]> = {
    instagram: [
      `Meet the product you didn't know you needed. ${description} — crafted with care, designed for you. Discover what makes us different and why people are making the switch every single day.`,
      `Your next favorite thing starts here. ${description} — built for people who appreciate quality without compromise. Shop now and experience the difference that real craftsmanship makes in your daily routine.`,
    ],
    facebook: [
      `Meet the product you didn't know you needed. ${description} — built for people who appreciate quality without compromise. We poured months of research into making sure every detail feels right from the very first use.`,
      `Great things take time — and this one was worth the wait. ${description} — explore the full range and find your perfect match. Designed to fit seamlessly into your lifestyle without the usual tradeoffs.`,
    ],
    linkedin: [
      `We're excited to share something we've been working on. ${description} — this represents our commitment to innovation and delivering real value to the people who trust us with their time and hard-earned money.`,
      `Behind every product is a team that cares deeply about getting it right. ${description} — built with purpose, delivered with pride. Connect with us to learn more about the journey from idea to your hands.`,
    ],
    x: [
      `New drop: ${description}. Clean design, better quality, fair price. No gimmicks — just a product we're proud to put our name behind. Check it out and see what all the buzz is about today.`,
      `${description} — finally here and ready for you. Built for people who actually care about what they use every single day. Tap to shop now before it sells out completely.`,
    ],
  };
  const platformCopies = copies[platformId] || copies.instagram;
  return platformCopies[Math.floor(Math.random() * platformCopies.length)];
}

const assetTypeLabels: Record<string, string> = {
  post: "Post",
  story: "Story",
  reel: "Reel",
  carousel: "Carousel",
};

function getAssetAspectRatio(platformId: string, type: string): string {
  const key = `${platformId}:${type}`;
  const ratios: Record<string, string> = {
    "instagram:post": "1/1",
    "instagram:story": "9/16",
    "instagram:reel": "9/16",
    "instagram:carousel": "1/1",
    "facebook:post": "1.91/1",
    "facebook:story": "9/16",
    "facebook:reel": "9/16",
    "facebook:carousel": "1.91/1",
    "linkedin:post": "1.91/1",
    "linkedin:story": "9/16",
    "linkedin:reel": "9/16",
    "linkedin:carousel": "1.91/1",
    "x:post": "16/9",
    "x:story": "9/16",
    "x:reel": "9/16",
    "x:carousel": "16/9",
  };
  return ratios[key] || "1/1";
}

function getImageDimensionsForType(platformId: string, type: string): { w: number; h: number } {
  return { w: 400, h: 400 };
}

export default function WorkspacePage(_props: WorkspacePageProps) {
  const { isLoading, isExiting } = useSkeletonLoading(2000);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(["instagram", "facebook"]);
  const [productDescription, setProductDescription] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [currentGenerationStep, setCurrentGenerationStep] = React.useState("");
  const [assetLocks, setAssetLocks] = React.useState<Record<string, "none" | "image" | "copy">>({});
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string | null>(null);
  const [showDraftModal, setShowDraftModal] = React.useState(false);
  const [draftToLoad, setDraftToLoad] = React.useState<Campaign | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<{ src: string; alt: string } | null>(null);
  const [editingCampaignId, setEditingCampaignId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [showEditTitleModal, setShowEditTitleModal] = React.useState(false);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const activeCampaign = selectedCampaign || campaigns.find((c) => c.status === "generating");
  const activeAssets = activeCampaign?.assets || [];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const toggleAssetLock = (assetId: string, lockType: "image" | "copy") => {
    setAssetLocks((prev) => {
      const current = prev[assetId] || "none";
      if (current === lockType) return { ...prev, [assetId]: "none" };
      return { ...prev, [assetId]: lockType };
    });
  };

  const handleRegenerateAsset = async (asset: GeneratedAsset) => {
    const lock = assetLocks[asset.id] || "none";

    if (lock === "image") {
      const newText = generateCopyForPlatform(asset.platformId, activeCampaign?.productDescription || "");
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== activeCampaign?.id) return c;
          return {
            ...c,
            assets: c.assets?.map((a) =>
              a.id === asset.id ? { ...a, text: newText } : a
            ),
          };
        })
      );
      return;
    }

    if (lock === "copy") {
      const dims = getImageDimensionsForType(asset.platformId, asset.type);
      const newImageUrl = `https://picsum.photos/seed/${asset.platformId}-${asset.type}-${generateId()}/${dims.w}/${dims.h}`;
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== activeCampaign?.id) return c;
          return {
            ...c,
            assets: c.assets?.map((a) =>
              a.id === asset.id ? { ...a, imageUrl: newImageUrl } : a
            ),
          };
        })
      );
      return;
    }

    const newText = generateCopyForPlatform(asset.platformId, activeCampaign?.productDescription || "");
    const dims = getImageDimensionsForType(asset.platformId, asset.type);
    const newImageUrl = `https://picsum.photos/seed/${asset.platformId}-${asset.type}-${generateId()}/${dims.w}/${dims.h}`;
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== activeCampaign?.id) return c;
        return {
          ...c,
          assets: c.assets?.map((a) =>
            a.id === asset.id ? { ...a, text: newText, imageUrl: newImageUrl } : a
          ),
        };
      })
    );
  };

  const handleEditTitle = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setEditingCampaignId(campaignId);
      setEditTitle(campaign.title);
      setShowEditTitleModal(true);
    }
  };

  const handleSaveTitle = () => {
    if (editingCampaignId && editTitle.trim()) {
      setCampaigns((prev) =>
        prev.map((c) => c.id === editingCampaignId ? { ...c, title: editTitle.trim() } : c)
      );
    }
    setShowEditTitleModal(false);
    setEditingCampaignId(null);
    setEditTitle("");
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    if (selectedCampaignId === campaignId) setSelectedCampaignId(null);
  };

  const handleGenerate = async () => {
    if (!productDescription.trim()) return;

    const draftToClear = campaigns.find((c) => c.status === "draft");
    if (draftToClear) setCampaigns((prev) => prev.filter((c) => c.id !== draftToClear.id));

    const newCampaign: Campaign = {
      id: `campaign-${generateId()}`,
      title: productDescription.length > 30 ? productDescription.substring(0, 30).trim() + "..." : productDescription,
      brandId: "brand-1",
      productDescription,
      platforms: selectedPlatforms.map((id) => ({ id, name: platformNames[id] || id, enabled: true })),
      status: "generating",
      createdAt: new Date(),
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    setSelectedCampaignId(newCampaign.id);
    setIsGenerating(true);
    setGenerationProgress(0);

    const steps = [
      { progress: 15, step: "Analyzing product..." },
      { progress: 30, step: "Researching market trends..." },
      { progress: 45, step: "Generating brand voice..." },
      { progress: 60, step: "Writing copy variations..." },
      { progress: 75, step: "Generating images..." },
      { progress: 90, step: "Optimizing for platforms..." },
      { progress: 100, step: "Finalizing..." },
    ];

    for (const { progress, step } of steps) {
      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
      setGenerationProgress(progress);
      setCurrentGenerationStep(step);
    }

    const platformTypes: Record<string, string[]> = {
      instagram: ["post", "story", "reel"],
      facebook: ["post", "story", "reel"],
      linkedin: ["post", "story"],
      x: ["post", "reel"],
    };

    const assets: GeneratedAsset[] = selectedPlatforms.map((platformId, index) => {
      const types = platformTypes[platformId] || ["post"];
      const assetType = types[index % types.length] as GeneratedAsset["type"];
      const dims = getImageDimensionsForType(platformId, assetType);
      return {
        id: `asset-${generateId()}-${platformId}`,
        platformId,
        platformName: platformNames[platformId] || platformId,
        type: assetType,
        text: generateCopyForPlatform(platformId, productDescription),
        imageUrl: `https://picsum.photos/seed/${platformId}-${assetType}-${generateId()}/${dims.w}/${dims.h}`,
      };
    });

    setCampaigns((prev) =>
      prev.map((c) => c.id === newCampaign.id ? { ...c, status: "completed", assets } : c)
    );

    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentGenerationStep("");
    setProductDescription("");
  };

  const handleLoadDraft = (campaign: Campaign) => {
    setDraftToLoad(campaign);
    setShowDraftModal(true);
  };

  const confirmLoadDraft = () => {
    if (draftToLoad) {
      setSelectedPlatforms(draftToLoad.platforms.map((p) => p.id));
      setProductDescription(draftToLoad.productDescription);
      setShowDraftModal(false);
      setDraftToLoad(null);
    }
  };

  const handleRegenerate = async (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    setCampaigns((prev) =>
      prev.map((c) => c.id === campaignId ? { ...c, status: "generating", assets: [] } : c)
    );
    setSelectedCampaignId(campaignId);
    setIsGenerating(true);
    setGenerationProgress(0);

    const steps = [
      { progress: 20, step: "Regenerating copy..." },
      { progress: 50, step: "Creating new visuals..." },
      { progress: 80, step: "Optimizing..." },
      { progress: 100, step: "Finalizing..." },
    ];

    for (const { progress, step } of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300));
      setGenerationProgress(progress);
      setCurrentGenerationStep(step);
    }

    const platformTypesForRegen: Record<string, string[]> = {
      instagram: ["post", "story", "reel"],
      facebook: ["post", "story", "reel"],
      linkedin: ["post", "story"],
      x: ["post", "reel"],
    };

    const assets: GeneratedAsset[] = campaign.platforms.map((platform, index) => {
      const types = platformTypesForRegen[platform.id] || ["post"];
      const assetType = types[index % types.length] as GeneratedAsset["type"];
      const dims = getImageDimensionsForType(platform.id, assetType);
      return {
        id: `asset-${generateId()}-${platform.id}`,
        platformId: platform.id,
        platformName: platform.name,
        type: assetType,
        text: generateCopyForPlatform(platform.id, campaign.productDescription),
        imageUrl: `https://picsum.photos/seed/${platform.id}-${assetType}-${generateId()}/${dims.w}/${dims.h}`,
      };
    });

    setCampaigns((prev) =>
      prev.map((c) => c.id === campaignId ? { ...c, status: "completed", assets } : c)
    );
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentGenerationStep("");
  };

  const handleDuplicateCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: `campaign-${generateId()}`,
      title: `${campaign.title} (Copy)`,
      status: "draft",
      assets: undefined,
      createdAt: new Date(),
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className={isExiting ? "skeleton-container-exit" : ""}>
          <WorkspaceSkeleton />
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Page header — refined typography */}
        <div className="mb-8">
          <h1
            className="text-[24px] font-bold tracking-tight text-[var(--text)]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Campaign Workspace
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1.5">
            Generate high-performing social content for your business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="udon-card-elevated py-0">
              <CardContent className="p-6">
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-2 uppercase tracking-[0.05em]">
                    Product / Service Description
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="What do you want to promote? Describe your product, service, or campaign idea..."
                    className="udon-input h-28 resize-none text-[13px]"
                    style={{ padding: '12px 14px' }}
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-3 uppercase tracking-[0.05em]">
                    Select Platforms
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {platforms.map((platform) => {
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          onClick={() => togglePlatform(platform.id)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border text-[13px] font-medium transition-all duration-200",
                            isSelected
                              ? `${platform.borderColor} ${platform.bgColor} ${platform.textColor}`
                              : "border-[var(--border-light)] bg-white text-[var(--text-muted)] hover:border-[var(--border-default)] hover:bg-[var(--bg-secondary)]"
                          )}
                        >
                          <PlatformIcon name={platform.id} className="w-4 h-4 shrink-0" />
                          <span className="truncate">{platform.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isGenerating ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--text-secondary)] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--accent-2)] udon-pulse-slow" />
                        {currentGenerationStep}
                      </span>
                      <span className="text-[var(--text-muted)] tabular-nums">{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!productDescription.trim() || selectedPlatforms.length === 0}
                    className="udon-btn udon-btn-primary w-full font-semibold py-3 h-12 rounded-[12px] text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Campaign Content
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Generated Assets */}
            {activeAssets.length > 0 && !isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-[var(--text)]" style={{ letterSpacing: "-0.01em" }}>Generated Content</h2>
                  <span className="text-[12px] text-[var(--text-muted)] tabular-nums">{activeAssets.length} assets</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAssets.map((asset) => {
                    const platform = platforms.find((p) => p.id === asset.platformId);
                    const lock = assetLocks[asset.id] || "none";
                    return (
                      <Card key={asset.id} className="udon-card overflow-hidden py-0">
                        <CardContent className="p-0">
                          {asset.imageUrl && (
                            <div
                              className="relative aspect-square bg-[var(--bg-secondary)] cursor-pointer group overflow-hidden"
                              onClick={() => setSelectedImage({ src: asset.imageUrl!, alt: `${asset.platformName} preview` })}
                            >
                              <img
                                src={asset.imageUrl}
                                alt={`${asset.platformName} content`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.image-fallback');
                                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="image-fallback absolute inset-0 items-center justify-center bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-surface)]" style={{ display: 'none' }}>
                                <ImageIcon className="w-10 h-10 text-[var(--text-muted)]" />
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] font-medium text-[var(--text)] bg-white/90 px-3 py-1.5 rounded-[8px] shadow-sm">
                                  Click to enlarge
                                </span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleAssetLock(asset.id, "image"); }}
                                className={cn(
                                  "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
                                  lock === "image"
                                    ? "bg-[var(--accent)] text-white shadow-md"
                                    : "bg-white/80 text-[var(--text-muted)] hover:bg-white hover:text-[var(--text)] opacity-0 group-hover:opacity-100"
                                )}
                              >
                                {lock === "image" ? (
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                                )}
                              </button>
                            </div>
                          )}
                          <div className="px-4 pt-3 pb-2">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={cn("text-[10px] font-medium border", platform?.className || "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-light)]")}>
                                <PlatformIcon name={asset.platformId} className="w-3 h-3 mr-1.5" />
                                {asset.platformName}
                              </Badge>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => toggleAssetLock(asset.id, "copy")}
                                  className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                                    lock === "copy"
                                      ? "bg-[var(--accent)] text-white"
                                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)]"
                                  )}
                                >
                                  {lock === "copy" ? (
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                  ) : (
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                                  )}
                                </button>
                                <Badge variant="outline" className="text-[10px] text-[var(--text-muted)] border-[var(--border-light)]">{assetTypeLabels[asset.type] || asset.type}</Badge>
                              </div>
                            </div>
                            <p className="text-[13px] text-[var(--text)] leading-relaxed mb-3 line-clamp-3">{asset.text}</p>
                            <div className="flex gap-2 mt-0.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-9 rounded-[8px] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] text-[12px]"
                              >
                                <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Use Asset
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRegenerateAsset(asset)}
                                className="flex-1 h-9 rounded-[8px] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] text-[12px]"
                              >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                {lock === "image" ? "Regen Copy" : lock === "copy" ? "Regen Image" : "Regenerate"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {activeAssets.length === 0 && !isGenerating && (
              <Card className="bg-white border-dashed border-[var(--border-default)] shadow-none">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-[16px] bg-[var(--bg-surface)] flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-secondary)] text-[13px] font-medium mb-1">No content yet</p>
                  <p className="text-[var(--text-muted)] text-[12px]">Describe your product and select platforms to generate your first campaign</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.04em]">Campaign History</h2>
              <span className="text-[11px] text-[var(--text-muted)]">{campaigns.length}</span>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2 px-1 py-1">
                {campaigns.map((campaign) => {
                  const isActive = activeCampaign?.id === campaign.id;
                  return (
                    <Card
                      key={campaign.id}
                      className={cn(
                        "bg-white shadow-sm cursor-pointer transition-all duration-200",
                        isActive && "ring-2 ring-[var(--accent)]/30 border-[var(--accent)]/20",
                        !isActive && "hover:shadow-md"
                      )}
                      onClick={() => {
                        if (campaign.status === "draft") handleLoadDraft(campaign);
                        else setSelectedCampaignId(campaign.id);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1.5">
                          <h3 className="text-[13px] font-semibold text-[var(--text)] truncate flex-1 min-w-0">{campaign.title}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-6 w-6 p-0 shrink-0 ml-1 text-[var(--text-muted)] hover:text-[var(--text)] rounded-[6px] inline-flex items-center justify-center cursor-pointer">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-[var(--border-default)] rounded-[12px] shadow-[var(--shadow-md)]">
                              <DropdownMenuItem onPointerDown={(e) => { e.preventDefault(); handleEditTitle(campaign.id); }} className="text-[12px] text-[var(--text)] gap-2 cursor-pointer">
                                <Pencil className="w-3.5 h-3.5" />Edit Title
                              </DropdownMenuItem>
                              {campaign.status === "completed" && (
                                <DropdownMenuItem onPointerDown={(e) => { e.preventDefault(); handleRegenerate(campaign.id); }} className="text-[12px] text-[var(--text)] gap-2 cursor-pointer">
                                  <RotateCcw className="w-3.5 h-3.5" />Regenerate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onPointerDown={(e) => { e.preventDefault(); handleDuplicateCampaign(campaign); }} className="text-[12px] text-[var(--text)] gap-2 cursor-pointer">
                                <Copy className="w-3.5 h-3.5" />Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onPointerDown={(e) => { e.preventDefault(); handleDeleteCampaign(campaign.id); }} className="text-[12px] text-[var(--danger)] gap-2 cursor-pointer">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <StatusDot status={campaign.status} />
                          <span className="text-[11px] text-[var(--text-muted)] capitalize">{campaign.status}</span>
                        </div>
                        <div className="flex gap-1">
                          {campaign.platforms.map((p) => (
                            <Badge key={p.id} variant="outline" className={cn("text-[9px] px-1.5 py-0 h-5 border", platforms.find((pl) => pl.id === p.id)?.className || "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-light)]")}>
                              <PlatformIcon name={p.id} className="w-2.5 h-2.5 mr-1" />
                              {p.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {campaign.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          {campaign.status === "draft" && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 badge-udon-generating">Draft</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Draft Load Modal */}
      <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <DialogContent className="bg-white border-[var(--border-default)] sm:max-w-md rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Load Draft?</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              This will replace your current input with the draft campaign details. Unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          {draftToLoad && (
            <div className="py-2">
              <p className="text-[13px] font-medium text-[var(--text)]">{draftToLoad.title}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-1 line-clamp-2">{draftToLoad.productDescription}</p>
            </div>
          )}
          <DialogSeparator className="bg-[var(--border-light)]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDraftModal(false)} className="rounded-[12px] border-[var(--border-default)] text-[var(--text)] text-[13px]">Cancel</Button>
            <Button onClick={confirmLoadDraft} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[12px] text-[13px]">Load Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Title Modal */}
      <Dialog open={showEditTitleModal} onOpenChange={setShowEditTitleModal}>
        <DialogContent className="bg-white border-[var(--border-default)] sm:max-w-md rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Edit Campaign Title</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">Give your campaign a memorable name.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); }}
              className="w-full px-4 py-2.5 rounded-[12px] border border-[var(--border-default)] bg-white text-[var(--text)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all duration-200"
              placeholder="Campaign title"
              autoFocus
            />
          </div>
          <DialogSeparator className="bg-[var(--border-light)]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTitleModal(false)} className="rounded-[12px] border-[var(--border-default)] text-[var(--text)] text-[13px]">Cancel</Button>
            <Button onClick={handleSaveTitle} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[12px] text-[13px]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="bg-white border-[var(--border-default)] sm:max-w-3xl p-2 rounded-[16px]">
          {selectedImage && (
            <img src={selectedImage.src} alt={selectedImage.alt} className="w-full h-auto rounded-[12px]" />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function StatusDot({ status }: { status: "draft" | "generating" | "completed" | "failed" }) {
  const dotClass = {
    draft: "status-queued",
    generating: "status-generating",
    completed: "status-ready",
    failed: "status-failed",
  }[status];
  return <span className={`status-dot ${dotClass}`} />;
}
