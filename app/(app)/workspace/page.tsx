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
import {
  Check, Copy, Sparkles, RotateCcw, MoreHorizontal, Pencil, Image as ImageIcon,
  RefreshCw, ChevronDown, Globe, Link as LinkIcon, Palette, Type, Eye, EyeOff,
  ChevronRight, Layers,
} from "lucide-react";
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

/* ─── Interfaces ──────────────────────────────────────────────── */

interface BrandProfile {
  id: string;
  name: string;
  url: string;
  colors: { name: string; hex: string }[];
  fonts: { name: string; category: string }[];
  tone: string[];
  missionStatement?: string;
  tagline?: string;
  logo?: string | null;
  logos?: { url: string; type: string; format: string; width?: number; height?: number }[];
  brandImages?: { url: string; alt: string; type: string }[];
}

interface Campaign {
  id: string;
  title: string;
  brandId: string;
  productDescription: string;
  brandProfile?: string;
  platforms: { id: string; name: string; enabled: boolean }[];
  selectedFormats: Record<string, string[]>;
  status: "draft" | "generating" | "completed" | "failed";
  assets?: GeneratedAsset[];
  createdAt: Date;
}

interface GeneratedAsset {
  id: string;
  platformId: string;
  platformName: string;
  type: string;
  typeLabel: string;
  text: string;
  imageUrl?: string;
  width: number;
  height: number;
}

interface PlatformFormat {
  type: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

interface WorkspacePageProps {
  user?: {
    name: string;
    email: string;
    initials: string;
    plan: "FREE" | "PRO";
  };
}

/* ─── Constants ───────────────────────────────────────────────── */

const BRAND_PROFILES_KEY = "udon_brand_profiles";

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
};

const platformFormats: Record<string, PlatformFormat[]> = {
  instagram: [
    { type: "post", label: "Post", width: 1080, height: 1080, aspectRatio: "1/1" },
    { type: "story", label: "Story", width: 1080, height: 1920, aspectRatio: "9/16" },
    { type: "reel", label: "Reel Cover", width: 1080, height: 1920, aspectRatio: "9/16" },
  ],
  facebook: [
    { type: "post", label: "Feed Post", width: 1200, height: 630, aspectRatio: "1.91/1" },
    { type: "story", label: "Story", width: 1080, height: 1920, aspectRatio: "9/16" },
    { type: "ad", label: "Ad Creative", width: 1080, height: 1080, aspectRatio: "1/1" },
  ],
  linkedin: [
    { type: "post", label: "Feed Post", width: 1200, height: 627, aspectRatio: "1.91/1" },
    { type: "banner", label: "Banner", width: 1584, height: 396, aspectRatio: "4/1" },
  ],
  x: [
    { type: "post", label: "Post", width: 1600, height: 900, aspectRatio: "16/9" },
    { type: "image", label: "Image Post", width: 1600, height: 900, aspectRatio: "16/9" },
  ],
};

const defaultSelectedFormats: Record<string, string[]> = {
  instagram: ["post", "story"],
  facebook: ["post"],
  linkedin: ["post"],
  x: ["post"],
};

const platforms = [
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "x", name: "X (Twitter)" },
];

const platformStyles: Record<string, { border: string; bg: string; text: string; accent: string; headerBg: string }> = {
  instagram: { border: "border-pink-200", bg: "bg-pink-50", text: "text-pink-600", accent: "#ec4899", headerBg: "bg-pink-50/80" },
  facebook: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-600", accent: "#3b82f6", headerBg: "bg-blue-50/80" },
  linkedin: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", accent: "#1d4ed8", headerBg: "bg-blue-50/80" },
  x: { border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-700", accent: "#374151", headerBg: "bg-gray-50/80" },
};

/* ─── Helpers ─────────────────────────────────────────────────── */

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function loadBrandProfiles(): BrandProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BRAND_PROFILES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBrandProfiles(profiles: BrandProfile[]) {
  localStorage.setItem(BRAND_PROFILES_KEY, JSON.stringify(profiles));
}

function getBrandLogoUrl(brand: BrandProfile | null): string | null {
  if (!brand) return null;
  if (brand.logos && brand.logos.length > 0) return brand.logos[0].url;
  return brand.logo || null;
}

function getBrandPrimaryColor(brand: BrandProfile | null): string | null {
  if (!brand || !brand.colors || brand.colors.length === 0) return null;
  return brand.colors[0]?.hex || null;
}

function getBrandImageForAsset(brand: BrandProfile | null, platformId: string, formatType: string): string | null {
  if (!brand?.brandImages || brand.brandImages.length === 0) return null;

  const preferredTypes: Record<string, string[]> = {
    post: ["hero", "banner", "product", "feature"],
    story: ["hero", "banner", "feature"],
    reel: ["hero", "banner", "feature"],
    ad: ["product", "hero", "banner", "feature"],
    banner: ["banner", "hero"],
    image: ["hero", "banner", "product"],
  };

  const prefs = preferredTypes[formatType] || ["hero", "banner", "product"];

  for (const pref of prefs) {
    const match = brand.brandImages.find((img) => img.type === pref);
    if (match) return match.url;
  }

  return brand.brandImages[0]?.url || null;
}

function generateCopyForPlatform(
  platformId: string,
  description: string,
  brand: BrandProfile | null,
  formatType: string
): string {
  const brandName = brand?.name || "";
  const tone = brand?.tone?.[0]?.toLowerCase() || "professional";
  const tagline = brand?.tagline || "";
  const brandHint = brandName ? ` ${brandName}` : "";
  const taglineHint = tagline ? ` — ${tagline}` : "";

  const isShort = formatType === "story" || formatType === "reel";

  if (isShort) {
    const shortCopies: Record<string, string[]> = {
      instagram: [
        `${brandHint} ${description} — swipe up to discover more.${taglineHint}`,
        `Your daily dose of ${tone}.${brandHint} ${description}.${taglineHint}`,
      ],
      facebook: [
        `${brandHint} ${description} — watch the story behind the product.${taglineHint}`,
        `Quick look at what's new:${brandHint} ${description}.${taglineHint}`,
      ],
      linkedin: [
        `Behind the scenes:${brandHint} ${description}.${taglineHint}`,
        `${brandHint} ${description} — built with purpose.${taglineHint}`,
      ],
      x: [
        `${brandHint} ${description} — the short version.${taglineHint}`,
        `TL;DR:${brandHint} ${description}.${taglineHint}`,
      ],
    };
    const copies = shortCopies[platformId] || shortCopies.instagram;
    return copies[Math.floor(Math.random() * copies.length)];
  }

  if (formatType === "banner") {
    return `${brandHint} ${description}. Built for teams that value ${tone} execution and real results. Learn more at our website.${taglineHint}`;
  }

  if (formatType === "ad") {
    return `${brandHint} ${description}. Limited time offer — designed for people who appreciate quality without compromise. Shop now.${taglineHint}`;
  }

  const copies: Record<string, string[]> = {
    instagram: [
      `Meet the product you didn't know you needed.${brandHint} ${description} — crafted with care, designed for you.${taglineHint}`,
      `Your next favorite thing starts here.${brandHint} ${description} — built for people who appreciate quality.${taglineHint}`,
      `This is what ${tone} looks like.${brandHint} ${description} — every detail matters.${taglineHint}`,
    ],
    facebook: [
      `Meet the product you didn't know you needed.${brandHint} ${description} — built for people who appreciate quality.${taglineHint}`,
      `Great things take time — and this one was worth the wait.${brandHint} ${description}.${taglineHint}`,
    ],
    linkedin: [
      `We're excited to share something we've been working on.${brandHint} ${description}.${taglineHint}`,
      `Behind every product is a team that cares.${brandHint} ${description} — built with purpose.${taglineHint}`,
    ],
    x: [
      `New drop:${brandHint} ${description}. Clean design, better quality, fair price.${taglineHint}`,
      `${brandHint} ${description} — finally here. Built for people who care about what they use.${taglineHint}`,
    ],
  };

  const platformCopies = copies[platformId] || copies.instagram;
  return platformCopies[Math.floor(Math.random() * platformCopies.length)];
}

/* ─── Component ───────────────────────────────────────────────── */

export default function WorkspacePage(_props: WorkspacePageProps) {
  const { isLoading, isExiting } = useSkeletonLoading(2000);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(["instagram", "facebook"]);
  const [selectedFormats, setSelectedFormats] = React.useState<Record<string, string[]>>(defaultSelectedFormats);
  const [productDescription, setProductDescription] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [currentGenerationStep, setCurrentGenerationStep] = React.useState("");
  const [assetLocks, setAssetLocks] = React.useState<Record<string, "none" | "image" | "copy">>({});
  const [hiddenAssetIds, setHiddenAssetIds] = React.useState<Set<string>>(new Set());
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string | null>(null);
  const [showDraftModal, setShowDraftModal] = React.useState(false);
  const [draftToLoad, setDraftToLoad] = React.useState<Campaign | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<{ src: string; alt: string } | null>(null);
  const [editingCampaignId, setEditingCampaignId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [showEditTitleModal, setShowEditTitleModal] = React.useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = React.useState<Set<string>>(new Set(["instagram", "facebook", "linkedin", "x"]));

  const [brandProfiles, setBrandProfiles] = React.useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = React.useState<string | null>(null);
  const [brandUrlInput, setBrandUrlInput] = React.useState("");
  const [isExtractingBrand, setIsExtractingBrand] = React.useState(false);
  const [showBrandExtractModal, setShowBrandExtractModal] = React.useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = React.useState(false);

  const selectedBrand = React.useMemo(
    () => brandProfiles.find((b) => b.id === selectedBrandId) || null,
    [brandProfiles, selectedBrandId]
  );

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const activeCampaign = selectedCampaign || campaigns.find((c) => c.status === "generating");
  const activeAssets = activeCampaign?.assets || [];

  const visibleAssets = React.useMemo(
    () => activeAssets.filter((a) => !hiddenAssetIds.has(a.id)),
    [activeAssets, hiddenAssetIds]
  );

  const assetsByPlatform = React.useMemo(() => {
    const groups: Record<string, GeneratedAsset[]> = {};
    for (const asset of visibleAssets) {
      if (!groups[asset.platformId]) groups[asset.platformId] = [];
      groups[asset.platformId].push(asset);
    }
    return groups;
  }, [visibleAssets]);

  React.useEffect(() => {
    setBrandProfiles(loadBrandProfiles());
  }, []);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId];
      if (!prev.includes(platformId) && !selectedFormats[platformId]) {
        setSelectedFormats((f) => ({ ...f, [platformId]: defaultSelectedFormats[platformId] || [] }));
      }
      return next;
    });
  };

  const toggleFormat = (platformId: string, formatType: string) => {
    setSelectedFormats((prev) => {
      const current = prev[platformId] || [];
      const next = current.includes(formatType)
        ? current.filter((t) => t !== formatType)
        : [...current, formatType];
      return { ...prev, [platformId]: next };
    });
  };

  const toggleAssetVisibility = (assetId: string) => {
    setHiddenAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const toggleAssetLock = (assetId: string, lockType: "image" | "copy") => {
    setAssetLocks((prev) => {
      const current = prev[assetId] || "none";
      if (current === lockType) return { ...prev, [assetId]: "none" };
      return { ...prev, [assetId]: lockType };
    });
  };

  const togglePlatformExpanded = (platformId: string) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platformId)) next.delete(platformId);
      else next.add(platformId);
      return next;
    });
  };

  /* ─── Brand Extraction ──────────────────────────────────────── */

  const handleExtractBrand = async () => {
    if (!brandUrlInput.trim()) return;
    setIsExtractingBrand(true);
    try {
      const res = await fetch("/api/extract-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: brandUrlInput.trim() }),
      });
      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json();
      const profile: BrandProfile = {
        id: `brand-${generateId()}`,
        name: data.name || new URL(brandUrlInput.trim()).hostname.replace("www.", ""),
        url: brandUrlInput.trim(),
        colors: data.colors || [],
        fonts: data.fonts || [],
        tone: data.tone || [],
        missionStatement: data.missionStatement,
        tagline: data.tagline,
        logo: data.logo,
        logos: data.logos || [],
        brandImages: data.brandImages || [],
      };
      const updated = [...brandProfiles, profile];
      setBrandProfiles(updated);
      saveBrandProfiles(updated);
      setSelectedBrandId(profile.id);
      setBrandUrlInput("");
      setShowBrandExtractModal(false);
    } catch (err) {
      console.error("Brand extraction failed:", err);
    } finally {
      setIsExtractingBrand(false);
    }
  };

  const handleRemoveBrand = (brandId: string) => {
    const updated = brandProfiles.filter((b) => b.id !== brandId);
    setBrandProfiles(updated);
    saveBrandProfiles(updated);
    if (selectedBrandId === brandId) setSelectedBrandId(null);
  };

  /* ─── Asset Regeneration ────────────────────────────────────── */

  const handleRegenerateAsset = async (asset: GeneratedAsset) => {
    const lock = assetLocks[asset.id] || "none";

    if (lock === "image") {
      const newText = generateCopyForPlatform(asset.platformId, activeCampaign?.productDescription || "", selectedBrand, asset.type);
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== activeCampaign?.id) return c;
          return { ...c, assets: c.assets?.map((a) => (a.id === asset.id ? { ...a, text: newText } : a)) };
        })
      );
      return;
    }

    if (lock === "copy") {
      const brandImage = getBrandImageForAsset(selectedBrand, asset.platformId, asset.type);
      const newImageUrl = brandImage || `https://picsum.photos/seed/${asset.platformId}-${asset.type}-${generateId()}/${asset.width}/${asset.height}`;
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== activeCampaign?.id) return c;
          return { ...c, assets: c.assets?.map((a) => (a.id === asset.id ? { ...a, imageUrl: newImageUrl } : a)) };
        })
      );
      return;
    }

    const newText = generateCopyForPlatform(asset.platformId, activeCampaign?.productDescription || "", selectedBrand, asset.type);
    const brandImage = getBrandImageForAsset(selectedBrand, asset.platformId, asset.type);
    const newImageUrl = brandImage || `https://picsum.photos/seed/${asset.platformId}-${asset.type}-${generateId()}/${asset.width}/${asset.height}`;
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== activeCampaign?.id) return c;
        return { ...c, assets: c.assets?.map((a) => (a.id === asset.id ? { ...a, text: newText, imageUrl: newImageUrl } : a)) };
      })
    );
  };

  /* ─── Campaign CRUD ─────────────────────────────────────────── */

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
        prev.map((c) => (c.id === editingCampaignId ? { ...c, title: editTitle.trim() } : c))
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

  const handleLoadDraft = (campaign: Campaign) => {
    setDraftToLoad(campaign);
    setShowDraftModal(true);
  };

  const confirmLoadDraft = () => {
    if (draftToLoad) {
      setSelectedPlatforms(draftToLoad.platforms.map((p) => p.id));
      setSelectedFormats(draftToLoad.selectedFormats || defaultSelectedFormats);
      setProductDescription(draftToLoad.productDescription);
      if (draftToLoad.brandProfile) setSelectedBrandId(draftToLoad.brandProfile);
      setShowDraftModal(false);
      setDraftToLoad(null);
    }
  };

  /* ─── Generation ────────────────────────────────────────────── */

  const handleGenerate = async () => {
    if (!productDescription.trim()) return;

    const draftToClear = campaigns.find((c) => c.status === "draft");
    if (draftToClear) setCampaigns((prev) => prev.filter((c) => c.id !== draftToClear.id));

    const formatsToGenerate: Record<string, string[]> = {};
    for (const pid of selectedPlatforms) {
      formatsToGenerate[pid] = selectedFormats[pid] || [];
    }

    const newCampaign: Campaign = {
      id: `campaign-${generateId()}`,
      title: productDescription.length > 30 ? productDescription.substring(0, 30).trim() + "..." : productDescription,
      brandId: selectedBrandId || "none",
      productDescription,
      brandProfile: selectedBrandId || undefined,
      platforms: selectedPlatforms.map((id) => ({ id, name: platformNames[id] || id, enabled: true })),
      selectedFormats: formatsToGenerate,
      status: "generating",
      createdAt: new Date(),
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    setSelectedCampaignId(newCampaign.id);
    setHiddenAssetIds(new Set());
    setIsGenerating(true);
    setGenerationProgress(0);

    const steps = [
      { progress: 10, step: "Analyzing product..." },
      { progress: 25, step: "Researching market trends..." },
      { progress: 40, step: "Loading brand guidelines..." },
      { progress: 55, step: "Generating copy variations..." },
      { progress: 70, step: "Creating visual concepts..." },
      { progress: 85, step: "Optimizing for platforms..." },
      { progress: 100, step: "Finalizing..." },
    ];

    for (const { progress, step } of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 400));
      setGenerationProgress(progress);
      setCurrentGenerationStep(step);
    }

    const assets: GeneratedAsset[] = [];

    for (const platformId of selectedPlatforms) {
      const formats = platformFormats[platformId] || [];
      const selectedTypes = formatsToGenerate[platformId] || [];

      for (const format of formats) {
        if (!selectedTypes.includes(format.type)) continue;

        const brandImage = getBrandImageForAsset(selectedBrand, platformId, format.type);
        const imageUrl = brandImage || `https://picsum.photos/seed/${platformId}-${format.type}-${generateId()}/${format.width}/${format.height}`;

        assets.push({
          id: `asset-${generateId()}-${platformId}-${format.type}`,
          platformId,
          platformName: platformNames[platformId] || platformId,
          type: format.type,
          typeLabel: format.label,
          text: generateCopyForPlatform(platformId, productDescription, selectedBrand, format.type),
          imageUrl,
          width: format.width,
          height: format.height,
        });
      }
    }

    setCampaigns((prev) =>
      prev.map((c) => (c.id === newCampaign.id ? { ...c, status: "completed", assets } : c))
    );

    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentGenerationStep("");
    setProductDescription("");
  };

  const handleRegenerate = async (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: "generating", assets: [] } : c))
    );
    setSelectedCampaignId(campaignId);
    setHiddenAssetIds(new Set());
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

    const brand = campaign.brandProfile
      ? brandProfiles.find((b) => b.id === campaign.brandProfile) || null
      : selectedBrand;

    const assets: GeneratedAsset[] = [];

    for (const platform of campaign.platforms) {
      const formats = platformFormats[platform.id] || [];
      const selectedTypes = campaign.selectedFormats?.[platform.id] || [];

      for (const format of formats) {
        if (!selectedTypes.includes(format.type)) continue;

        const brandImage = getBrandImageForAsset(brand, platform.id, format.type);
        const imageUrl = brandImage || `https://picsum.photos/seed/${platform.id}-${format.type}-${generateId()}/${format.width}/${format.height}`;

        assets.push({
          id: `asset-${generateId()}-${platform.id}-${format.type}`,
          platformId: platform.id,
          platformName: platform.name,
          type: format.type,
          typeLabel: format.label,
          text: generateCopyForPlatform(platform.id, campaign.productDescription, brand, format.type),
          imageUrl,
          width: format.width,
          height: format.height,
        });
      }
    }

    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: "completed", assets } : c))
    );
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentGenerationStep("");
  };

  /* ─── Render ────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className={isExiting ? "skeleton-container-exit" : ""}>
          <WorkspaceSkeleton />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--text)]" style={{ letterSpacing: "-0.025em" }}>
            Campaign Workspace
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1.5">
            Generate high-performing social content for your business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ─── Left: Input + Generated Content ──────────────── */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="udon-card-elevated py-0">
              <CardContent className="p-6">
                {/* Brand Profile Selector */}
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-2 uppercase tracking-[0.05em]">
                    Brand Profile
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-[13px] transition-all duration-200 text-left",
                        selectedBrand
                          ? "border-[var(--accent)]/30 bg-[var(--accent)]/5 text-[var(--text)]"
                          : "border-[var(--border-light)] bg-white text-[var(--text-muted)] hover:border-[var(--border-default)]"
                      )}
                    >
                      {selectedBrand ? (
                        <>
                          {getBrandLogoUrl(selectedBrand) ? (
                            <img src={getBrandLogoUrl(selectedBrand)!} alt="" className="w-5 h-5 rounded object-contain" />
                          ) : (
                            <Globe className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                          )}
                          <span className="truncate flex-1 font-medium">{selectedBrand.name}</span>
                          {getBrandPrimaryColor(selectedBrand) && (
                            <span className="w-3 h-3 rounded-full shrink-0 border border-[var(--border-light)]" style={{ backgroundColor: getBrandPrimaryColor(selectedBrand)! }} />
                          )}
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                          <span className="flex-1">No brand selected (optional)</span>
                        </>
                      )}
                      <ChevronDown className={cn("w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200", showBrandDropdown && "rotate-180")} />
                    </button>

                    {showBrandDropdown && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[var(--border-default)] rounded-[12px] shadow-[var(--shadow-lg)] py-1 max-h-60 overflow-y-auto">
                        {brandProfiles.length === 0 && (
                          <div className="px-3 py-4 text-center">
                            <p className="text-[12px] text-[var(--text-muted)]">No saved brand profiles</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Extract one from a URL below</p>
                          </div>
                        )}
                        {brandProfiles.map((brand) => (
                          <div
                            key={brand.id}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors",
                              selectedBrandId === brand.id && "bg-[var(--accent)]/5"
                            )}
                            onClick={() => { setSelectedBrandId(brand.id); setShowBrandDropdown(false); }}
                          >
                            {getBrandLogoUrl(brand) ? (
                              <img src={getBrandLogoUrl(brand)!} alt="" className="w-5 h-5 rounded object-contain" />
                            ) : (
                              <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                            <span className="flex-1 text-[13px] text-[var(--text)] truncate">{brand.name}</span>
                            {getBrandPrimaryColor(brand) && (
                              <span className="w-3 h-3 rounded-full shrink-0 border border-[var(--border-light)]" style={{ backgroundColor: getBrandPrimaryColor(brand)! }} />
                            )}
                            {selectedBrandId === brand.id && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
                          </div>
                        ))}
                        <div className="border-t border-[var(--border-light)] mt-1 pt-1">
                          {selectedBrandId && (
                            <button
                              onClick={() => { setSelectedBrandId(null); setShowBrandDropdown(false); }}
                              className="w-full text-left px-3 py-2 text-[12px] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                            >
                              Clear selection
                            </button>
                          )}
                          <button
                            onClick={() => { setShowBrandDropdown(false); setShowBrandExtractModal(true); }}
                            className="w-full text-left px-3 py-2 text-[12px] text-[var(--accent)] hover:bg-[var(--accent)]/5 font-medium flex items-center gap-1.5"
                          >
                            <LinkIcon className="w-3 h-3" /> Extract from URL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Profile Preview */}
                {selectedBrand && (
                  <div className="mb-5 p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-light)]">
                    <div className="flex items-center gap-3 mb-2">
                      {selectedBrand.colors.length > 0 && (
                        <div className="flex items-center gap-1">
                          {selectedBrand.colors.slice(0, 5).map((c, i) => (
                            <span key={i} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: c.hex }} title={c.name} />
                          ))}
                        </div>
                      )}
                      {selectedBrand.fonts.length > 0 && (
                        <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                          <Type className="w-3 h-3" />{selectedBrand.fonts.map((f) => f.name).join(", ")}
                        </span>
                      )}
                    </div>
                    {selectedBrand.tone.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedBrand.tone.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-[var(--border-light)] text-[var(--text-muted)]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {selectedBrand.brandImages && selectedBrand.brandImages.length > 0 && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-2 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {selectedBrand.brandImages.length} brand images available
                      </p>
                    )}
                  </div>
                )}

                {/* Product Description */}
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-2 uppercase tracking-[0.05em]">
                    Product / Service Description
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="What do you want to promote? Describe your product, service, or campaign idea..."
                    className="udon-input h-28 resize-none text-[13px]"
                    style={{ padding: "12px 14px" }}
                  />
                </div>

                {/* Platform + Format Selection */}
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-3 uppercase tracking-[0.05em]">
                    Select Platforms &amp; Formats
                  </label>
                  <div className="space-y-2">
                    {platforms.map((platform) => {
                      const isSelected = selectedPlatforms.includes(platform.id);
                      const isExpanded = expandedPlatforms.has(platform.id);
                      const formats = platformFormats[platform.id] || [];
                      const selectedTypes = selectedFormats[platform.id] || [];
                      const style = platformStyles[platform.id];

                      return (
                        <div key={platform.id} className={cn("rounded-[10px] border transition-all duration-200", isSelected ? `${style?.border} ${style?.bg}` : "border-[var(--border-light)] bg-white")}>
                          <button
                            onClick={() => togglePlatform(platform.id)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                              isSelected ? `${style?.text}` : "text-[var(--text-muted)] hover:text-[var(--text)]"
                            )}
                          >
                            <div
                              className="w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-200 shrink-0"
                              style={isSelected ? { borderColor: style?.accent, backgroundColor: style?.accent } : { borderColor: "var(--border-default)", backgroundColor: "white" }}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <PlatformIcon name={platform.id} className="w-4 h-4 shrink-0" />
                            <span className="flex-1 text-left">{platform.name}</span>
                            {isSelected && (
                              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border", `${style?.border} ${style?.text}`)}>
                                {selectedTypes.length} format{selectedTypes.length !== 1 ? "s" : ""}
                              </Badge>
                            )}
                            {isSelected && (
                              <button
                                onClick={(e) => { e.stopPropagation(); togglePlatformExpanded(platform.id); }}
                                className="w-5 h-5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
                              >
                                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200", isExpanded && "rotate-90")} />
                              </button>
                            )}
                          </button>

                          {isSelected && isExpanded && (
                            <div className="px-3 pb-2.5 pt-0.5 border-t border-[var(--border-light)]/50">
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {formats.map((format) => {
                                  const isFormatSelected = selectedTypes.includes(format.type);
                                  return (
                                    <button
                                      key={format.type}
                                      onClick={(e) => { e.stopPropagation(); toggleFormat(platform.id, format.type); }}
                                      className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] border text-[12px] font-medium transition-all duration-150",
                                        isFormatSelected
                                          ? "bg-white text-[var(--text)] shadow-sm"
                                          : "border-[var(--border-light)] bg-white/50 text-[var(--text-muted)] hover:bg-white hover:border-[var(--border-default)]"
                                      )}
                                      style={isFormatSelected ? { borderColor: `${style?.accent}40` } : undefined}
                                    >
                                      <div
                                        className="w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-all"
                                        style={isFormatSelected ? { borderColor: style?.accent, backgroundColor: style?.accent } : { borderColor: "var(--border-default)" }}
                                      >
                                        {isFormatSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                      </div>
                                      {format.label}
                                      <span className="text-[9px] text-[var(--text-muted)] opacity-60">{format.width}×{format.height}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Generate / Progress */}
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
                    disabled={!productDescription.trim() || selectedPlatforms.length === 0 || Object.values(selectedFormats).every((f) => f.length === 0)}
                    className="udon-btn udon-btn-primary w-full font-semibold py-3 h-12 rounded-[12px] text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Campaign Content
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ─── Generated Content — Platform Grouped ──────── */}
            {visibleAssets.length > 0 && !isGenerating && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-[var(--text)]" style={{ letterSpacing: "-0.01em" }}>
                    Generated Content
                  </h2>
                  <span className="text-[12px] text-[var(--text-muted)] tabular-nums">
                    {visibleAssets.length} of {activeAssets.length} assets
                  </span>
                </div>

                {Object.entries(assetsByPlatform).map(([platformId, assets]) => {
                  const style = platformStyles[platformId];
                  const allPlatformAssets = activeAssets.filter((a) => a.platformId === platformId);
                  const hiddenCount = allPlatformAssets.length - assets.length;

                  return (
                    <div key={platformId} className="space-y-3">
                      {/* Platform Header */}
                      <div className={cn("flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] border", style?.border, style?.headerBg)}>
                        <PlatformIcon name={platformId} className="w-5 h-5" />
                        <h3 className="text-[14px] font-semibold text-[var(--text)]">{platformNames[platformId]}</h3>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 border", style?.border, style?.text)}>
                          {assets.length} asset{assets.length !== 1 ? "s" : ""}
                        </Badge>
                        {hiddenCount > 0 && (
                          <span className="text-[11px] text-[var(--text-muted)] ml-auto flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> {hiddenCount} hidden
                          </span>
                        )}
                      </div>

                      {/* Platform Assets */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
                        {assets.map((asset) => {
                          const lock = assetLocks[asset.id] || "none";
                          return (
                            <Card key={asset.id} className="udon-card overflow-hidden py-0 group">
                              <CardContent className="p-0">
                                {/* Image */}
                                {asset.imageUrl && (
                                  <div
                                    className="relative bg-[var(--bg-secondary)] cursor-pointer group overflow-hidden"
                                    style={{ aspectRatio: `${asset.width}/${asset.height}` }}
                                    onClick={() => setSelectedImage({ src: asset.imageUrl!, alt: `${asset.platformName} ${asset.typeLabel}` })}
                                  >
                                    <img
                                      src={asset.imageUrl}
                                      alt={`${asset.platformName} ${asset.typeLabel}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (parent) {
                                          const fallback = parent.querySelector(".image-fallback");
                                          if (fallback) (fallback as HTMLElement).style.display = "flex";
                                        }
                                      }}
                                    />
                                    <div className="image-fallback absolute inset-0 items-center justify-center bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-surface)]" style={{ display: "none" }}>
                                      <ImageIcon className="w-10 h-10 text-[var(--text-muted)]" />
                                    </div>

                                    {/* Brand Logo Overlay */}
                                    {selectedBrand && getBrandLogoUrl(selectedBrand) && (
                                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-[6px] px-2 py-1 shadow-sm flex items-center gap-1.5">
                                        <img src={getBrandLogoUrl(selectedBrand)!} alt="" className="w-3.5 h-3.5 object-contain" />
                                        <span className="text-[10px] font-medium text-[var(--text)]">{selectedBrand.name}</span>
                                      </div>
                                    )}

                                    {/* Dimension Badge */}
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium px-1.5 py-0.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
                                      {asset.width}×{asset.height}
                                    </div>

                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center">
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] font-medium text-[var(--text)] bg-white/90 px-3 py-1.5 rounded-[8px] shadow-sm">
                                        Click to enlarge
                                      </span>
                                    </div>

                                    {/* Image Lock */}
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
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                                      )}
                                    </button>
                                  </div>
                                )}

                                {/* Content */}
                                <div className="px-3.5 pt-2.5 pb-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <Badge className={cn("text-[10px] font-medium border", style?.border, style?.bg, style?.text)}>
                                      {asset.typeLabel}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => toggleAssetVisibility(asset.id)}
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-all"
                                        title="Hide this asset"
                                      >
                                        <EyeOff className="w-3 h-3" />
                                      </button>
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
                                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        ) : (
                                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[12px] text-[var(--text)] leading-relaxed mb-2.5 line-clamp-3">{asset.text}</p>
                                  <div className="flex gap-1.5">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 h-8 rounded-[8px] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] text-[11px]"
                                    >
                                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                      Use
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRegenerateAsset(asset)}
                                      className="flex-1 h-8 rounded-[8px] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] text-[11px]"
                                    >
                                      <RefreshCw className="w-3 h-3 mr-1" />
                                      Regen
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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

          {/* ─── Right: Campaign History ─────────────────────── */}
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
                          {campaign.brandProfile && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-[var(--border-light)] text-[var(--text-muted)]">
                              {brandProfiles.find((b) => b.id === campaign.brandProfile)?.name || "Brand"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {campaign.platforms.map((p) => (
                            <Badge key={p.id} variant="outline" className={cn("text-[9px] px-1.5 py-0 h-5 border", platformStyles[p.id]?.border, platformStyles[p.id]?.text)}>
                              <PlatformIcon name={p.id} className="w-2.5 h-2.5 mr-1" />
                              {p.name}
                            </Badge>
                          ))}
                        </div>
                        {campaign.selectedFormats && (
                          <div className="flex gap-1 flex-wrap mt-1.5">
                            {Object.entries(campaign.selectedFormats).map(([pid, types]) =>
                              types.map((t) => (
                                <span key={`${pid}-${t}`} className="text-[8px] text-[var(--text-muted)] bg-[var(--bg-surface)] px-1 py-0.5 rounded">
                                  {platformNames[pid]?.slice(0, 3)} {t}
                                </span>
                              ))
                            )}
                          </div>
                        )}
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

      {/* ─── Modals ──────────────────────────────────────────── */}

      {/* Brand Extract Modal */}
      <Dialog open={showBrandExtractModal} onOpenChange={setShowBrandExtractModal}>
        <DialogContent className="bg-white border-[var(--border-default)] sm:max-w-md rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Extract Brand Profile</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Enter a website URL to automatically extract brand colors, fonts, tone, and visual assets.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="url"
                  value={brandUrlInput}
                  onChange={(e) => setBrandUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleExtractBrand(); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-[12px] border border-[var(--border-default)] bg-white text-[var(--text)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all duration-200"
                  placeholder="https://example.com"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <DialogSeparator className="bg-[var(--border-light)]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBrandExtractModal(false)} className="rounded-[12px] border-[var(--border-default)] text-[var(--text)] text-[13px]">
              Cancel
            </Button>
            <Button
              onClick={handleExtractBrand}
              disabled={!brandUrlInput.trim() || isExtractingBrand}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[12px] text-[13px] disabled:opacity-40"
            >
              {isExtractingBrand ? "Extracting..." : "Extract Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

/* ─── Subcomponents ───────────────────────────────────────────── */

function StatusDot({ status }: { status: "draft" | "generating" | "completed" | "failed" }) {
  const dotClass = {
    draft: "status-queued",
    generating: "status-generating",
    completed: "status-ready",
    failed: "status-failed",
  }[status];
  return <span className={`status-dot ${dotClass}`} />;
}
