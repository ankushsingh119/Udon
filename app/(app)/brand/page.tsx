"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Loader2, Palette, Type, FileText, Target, Users, Lightbulb, Globe, Camera, Megaphone, Plus, X, CheckCircle2, Image as ImageIcon, ZoomIn, Download } from "lucide-react";
import { BrandSkeleton } from "@/components/skeletons/brand-skeleton";
import { useSkeletonLoading } from "@/hooks/use-skeleton-loading";
import { cn } from "@/lib/utils";
import { generateBrandPDF } from "@/lib/generate-brand-pdf";

interface BrandProfilePageProps {
  user?: {
    name: string;
    email: string;
    initials: string;
    plan: "FREE" | "PRO";
  };
}

interface ExtractedBrand {
  name: string;
  url: string;
  colors: { name: string; hex: string }[];
  fonts: { name: string; category: string }[];
  tone: string[];
  missionStatement?: string;
  targetAudience?: string;
  brandValues?: string[];
  competitors?: string[];
  tagline?: string;
  logoDescription?: string;
  imageryStyle?: string[];
  socialLinks?: string[];
  description?: string;
  keywords?: string[];
  logo?: string | null;
  logos?: { url: string; type: string; format: string; width?: number; height?: number }[];
  brandImages?: { url: string; alt: string; type: string }[];
}

const sections = [
  { id: "overview", label: "Overview" },
  { id: "visual", label: "Visual Identity" },
  { id: "voice", label: "Brand Voice" },
  { id: "strategy", label: "Strategy" },
] as const;

export default function BrandProfilePage(_props: BrandProfilePageProps) {
  const { isLoading, isExiting } = useSkeletonLoading(2000);
  const [brandUrl, setBrandUrl] = React.useState("");
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractionProgress, setExtractionProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState("");
  const [extractedBrand, setExtractedBrand] = React.useState<ExtractedBrand | null>(null);
  const [activeSection, setActiveSection] = React.useState("overview");
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [extractionError, setExtractionError] = React.useState("");

  // Editable fields
  const [missionStatement, setMissionStatement] = React.useState("");
  const [targetAudience, setTargetAudience] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [brandValues, setBrandValues] = React.useState<string[]>([]);
  const [newValue, setNewValue] = React.useState("");
  const [competitors, setCompetitors] = React.useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = React.useState("");
  const [imageryStyle, setImageryStyle] = React.useState<string[]>([]);
  const [newImagery, setNewImagery] = React.useState("");
  const [lightboxImage, setLightboxImage] = React.useState<{ url: string; alt: string } | null>(null);

  const sectionRefs = React.useRef<Map<string, HTMLElement>>(new Map());

  // IntersectionObserver to track active section
  React.useEffect(() => {
    if (!extractedBrand) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    const refs = sectionRefs.current;
    refs.forEach((el) => observer.observe(el));

    return () => {
      refs.forEach((el) => observer.unobserve(el));
    };
  }, [extractedBrand]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const [exporting, setExporting] = React.useState(false);

  const handleExportPDF = async () => {
    if (!extractedBrand) return;
    setExporting(true);
    try {
      await generateBrandPDF(extractedBrand);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleExtract = async () => {
    if (!brandUrl.trim()) return;

    setIsExtracting(true);
    setExtractionProgress(0);
    setCurrentStep("Fetching website content...");
    setExtractionError("");

    try {
      const progressSteps = [
        { progress: 20, step: "Fetching website content..." },
        { progress: 40, step: "Analyzing brand identity..." },
        { progress: 60, step: "Extracting colors and typography..." },
        { progress: 80, step: "Building brand profile..." },
        { progress: 95, step: "Finalizing..." },
      ];

      const progressPromise = (async () => {
        for (const { progress, step } of progressSteps) {
          await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));
          setExtractionProgress(progress);
          setCurrentStep(step);
        }
      })();

      const fetchPromise = fetch("/api/extract-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: brandUrl }),
      });

      const [response] = await Promise.all([fetchPromise, progressPromise]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Extraction failed" }));
        throw new Error(errorData.error || "Failed to extract brand information");
      }

      const data: ExtractedBrand = await response.json();
      setExtractedBrand(data);
      setMissionStatement(data.missionStatement || "");
      setTargetAudience(data.targetAudience || "");
      setTagline(data.tagline || "");
      setBrandValues(data.brandValues || []);
      setCompetitors(data.competitors || []);
      setImageryStyle(data.imageryStyle || []);

      setExtractionProgress(100);
      setCurrentStep("Done!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Extraction failed. Please check the URL and try again.";
      setExtractionError(message);
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
      setCurrentStep("");
    }
  };

  const addBrandValue = () => {
    if (newValue.trim() && !brandValues.includes(newValue.trim())) {
      setBrandValues([...brandValues, newValue.trim()]);
      setNewValue("");
    }
  };

  const removeBrandValue = (value: string) => {
    setBrandValues(brandValues.filter((v) => v !== value));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !competitors.includes(newCompetitor.trim())) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (comp: string) => {
    setCompetitors(competitors.filter((c) => c !== comp));
  };

  const addImagery = () => {
    if (newImagery.trim() && !imageryStyle.includes(newImagery.trim())) {
      setImageryStyle([...imageryStyle, newImagery.trim()]);
      setNewImagery("");
    }
  };

  const removeImagery = (img: string) => {
    setImageryStyle(imageryStyle.filter((i) => i !== img));
  };

  if (isLoading) {
    return <div className={isExiting ? "skeleton-container-exit" : ""}><BrandSkeleton /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1
          className="text-[24px] font-bold tracking-tight text-[var(--text)]"
          style={{ letterSpacing: "-0.025em" }}
        >
          Brand Profile
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1.5">
          Extract and define your brand identity for consistent content generation
        </p>
      </div>

        {/* URL Extraction */}
        <Card className="udon-card-elevated border-0 mb-8">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[var(--text)]">Extract Brand from Website</h3>
                <p className="text-xs text-[var(--text-muted)]">Enter your website URL to automatically extract brand elements</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="udon-input flex-1"
                disabled={isExtracting}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExtract();
                }}
              />
              <Button
                onClick={handleExtract}
                disabled={!brandUrl.trim() || isExtracting}
                className="udon-btn-primary shrink-0"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Extract
                  </>
                )}
              </Button>
            </div>

            {isExtracting && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{currentStep}</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{extractionProgress}%</span>
                </div>
                <Progress value={extractionProgress} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success message */}
        {showSuccess && (
          <div className="mb-6 p-3 rounded-xl bg-[var(--success-light)] border border-[var(--success)]/20 flex items-center gap-2 text-[13px] text-[var(--success)] udon-fade-in-subtle">
            <CheckCircle2 className="w-4 h-4" />
            Brand profile extracted successfully!
          </div>
        )}

        {/* Error message */}
        {extractionError && (
          <div className="mb-6 p-3 rounded-xl bg-[var(--danger-light)] border border-[var(--danger)]/20 flex items-center gap-2 text-[13px] text-[var(--danger)] udon-fade-in-subtle">
            <X className="w-4 h-4" />
            {extractionError}
          </div>
        )}

        {/* Brand Profile Content */}
        {extractedBrand ? (
          <div className="space-y-6">
            {/* Section Navigation */}
            <nav className="sticky top-0 z-30 bg-[var(--bg-page)]/80 backdrop-blur-md py-3 -mx-8 px-8">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-xl w-fit">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                        activeSection === section.id
                          ? "bg-white text-[var(--text)] shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/50"
                      )}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="udon-btn-primary h-9 text-xs shrink-0"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Export Brand Profile
                    </>
                  )}
                </Button>
              </div>
            </nav>

            {/* Overview Section */}
            <section
              id="overview"
              ref={(el) => { if (el) sectionRefs.current.set("overview", el); }}
              className="space-y-6 scroll-mt-24"
            >
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] font-bold text-[var(--text)]">{extractedBrand.name}</h3>
                    <Badge variant="outline" className="text-xs border-[var(--border)] text-[var(--text-muted)]">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {extractedBrand.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                        Mission Statement
                      </label>
                      <textarea
                        value={missionStatement}
                        onChange={(e) => setMissionStatement(e.target.value)}
                        className="udon-input w-full h-20 resize-none"
                        placeholder="Describe your brand's mission..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                        Tagline
                      </label>
                      <Input
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Your brand's tagline"
                        className="udon-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Values */}
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Brand Values</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {brandValues.map((value) => (
                      <Badge
                        key={value}
                        variant="outline"
                        className="text-xs border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)] pl-2 pr-1 h-7"
                      >
                        {value}
                        <button
                          onClick={() => removeBrandValue(value)}
                          className="ml-1 p-0.5 rounded-full hover:bg-[var(--accent)]/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Add a brand value..."
                      className="udon-input h-9 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addBrandValue();
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addBrandValue}
                      className="udon-btn-secondary h-9 text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Target Audience */}
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Target Audience</h3>
                  </div>
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="udon-input w-full h-24 resize-none"
                    placeholder="Describe your ideal customer — age, interests, pain points, values..."
                  />
                </CardContent>
              </Card>
            </section>

            {/* Visual Identity Section */}
            <section
              id="visual"
              ref={(el) => { if (el) sectionRefs.current.set("visual", el); }}
              className="space-y-6 scroll-mt-24"
            >
              {/* Colors */}
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Color Palette</h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {extractedBrand.colors.map((color) => (
                      <div key={color.hex} className="group flex flex-col items-center">
                        <div
                          className="w-full h-10 rounded-lg border border-[var(--border)] shadow-sm transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 font-medium text-center leading-tight">{color.name}</p>
                        <p className="text-[9px] text-[var(--text-muted)] font-mono">{color.hex}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Type className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Typography</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {extractedBrand.fonts.map((font) => (
                      <div
                        key={font.name}
                        className="p-4 rounded-xl border border-[var(--border-default)] bg-white"
                      >
                        <p className="text-lg text-[var(--text)] mb-1" style={{ fontFamily: font.name }}>
                          {font.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{font.category}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Imagery Style */}
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Imagery Style</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {imageryStyle.map((img) => (
                      <Badge
                        key={img}
                        variant="outline"
                        className="text-xs border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)] pl-2 pr-1 h-7"
                      >
                        {img}
                        <button
                          onClick={() => removeImagery(img)}
                          className="ml-1 p-0.5 rounded-full hover:bg-[var(--accent)]/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newImagery}
                      onChange={(e) => setNewImagery(e.target.value)}
                      placeholder="Add imagery style descriptor..."
                      className="udon-input h-9 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addImagery();
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addImagery}
                      className="udon-btn-secondary h-9 text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Assets - Logos */}
              {extractedBrand.logos && extractedBrand.logos.length > 0 && (
                <Card className="udon-card-elevated border-0">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                      <h3 className="text-[14px] font-bold text-[var(--text)]">Brand Assets</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {extractedBrand.logos.map((logo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLightboxImage({ url: logo.url, alt: `Logo ${idx + 1}` })}
                          className="group relative p-4 rounded-xl border border-[var(--border-default)] bg-white hover:border-[var(--accent)]/30 hover:shadow-sm transition-all duration-200 flex flex-col items-center justify-center min-h-[100px]"
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          </div>
                          {logo.url === "inline-svg" ? (
                            <div className="w-12 h-12 flex items-center justify-center text-[var(--text-muted)]">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          ) : (
                            <img
                              src={logo.url}
                              alt={logo.type}
                              className="max-w-full max-h-16 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                          <div className="mt-2 text-center">
                            <p className="text-[10px] text-[var(--text-secondary)] capitalize">{logo.type.replace(/-/g, " ")}</p>
                            <p className="text-[9px] text-[var(--text-muted)] font-mono">{logo.format}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Brand Imagery */}
              {extractedBrand.brandImages && extractedBrand.brandImages.length > 0 && (
                <Card className="udon-card-elevated border-0">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Camera className="w-4 h-4 text-[var(--accent)]" />
                      <h3 className="text-[14px] font-bold text-[var(--text)]">Brand Imagery</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {extractedBrand.brandImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLightboxImage({ url: img.url, alt: img.alt || `Brand image ${idx + 1}` })}
                          className="group relative rounded-xl border border-[var(--border-default)] bg-white overflow-hidden hover:border-[var(--accent)]/30 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="aspect-video relative">
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).parentElement!.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                            </div>
                          </div>
                          <div className="p-2.5">
                            <p className="text-[10px] text-[var(--text-secondary)] capitalize truncate">{img.type.replace(/-/g, " ")}</p>
                            {img.alt && <p className="text-[9px] text-[var(--text-muted)] truncate mt-0.5">{img.alt}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Brand Voice Section */}
            <section
              id="voice"
              ref={(el) => { if (el) sectionRefs.current.set("voice", el); }}
              className="space-y-6 scroll-mt-24"
            >
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Megaphone className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Brand Tone</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {extractedBrand.tone.map((tone) => (
                      <div
                        key={tone}
                        className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-center"
                      >
                        <p className="text-[13px] font-medium text-[var(--text)]">{tone}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <h3 className="text-[14px] font-bold text-[var(--text)] mb-3">Voice Guidelines</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--success-light)] border border-[var(--success)]/20">
                      <p className="text-xs font-semibold text-[var(--success)] mb-2">Do</p>
                      <ul className="text-[13px] text-[var(--text-secondary)] space-y-1.5">
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--success)]" />Use warm, conversational language.</li>
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--success)]" />Be direct but friendly.</li>
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--success)]" />Show personality without being informal.</li>
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--success)]" />Tell stories that connect emotionally.</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--danger-light)] border border-[var(--danger)]/20">
                      <p className="text-xs font-semibold text-[var(--danger)] mb-2">Don&apos;t</p>
                      <ul className="text-[13px] text-[var(--text-secondary)] space-y-1.5">
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--danger)]" />Use corporate jargon.</li>
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--danger)]" />Be overly salesy or pushy.</li>
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--danger)]" />Use ALL CAPS or excessive punctuation!!!</li>
                        <li className="flex items-start gap-1.5"><span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-[var(--danger)]" />Make promises you can&apos;t keep.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Strategy Section */}
            <section
              id="strategy"
              ref={(el) => { if (el) sectionRefs.current.set("strategy", el); }}
              className="space-y-6 scroll-mt-24"
            >
              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Competitors</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {competitors.map((comp) => (
                      <Badge
                        key={comp}
                        variant="outline"
                        className="text-xs border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] pl-2 pr-1 h-7"
                      >
                        {comp}
                        <button
                          onClick={() => removeCompetitor(comp)}
                          className="ml-1 p-0.5 rounded-full hover:bg-[var(--border-light)] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newCompetitor}
                      onChange={(e) => setNewCompetitor(e.target.value)}
                      placeholder="Add a competitor..."
                      className="udon-input h-9 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCompetitor();
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCompetitor}
                      className="udon-btn-secondary h-9 text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="udon-card-elevated border-0">
                <CardContent className="p-5">
                  <h3 className="text-[14px] font-bold text-[var(--text)] mb-3">How Brand Profile Affects Generation</h3>
                  <div className="space-y-2 text-[13px] text-[var(--text-secondary)]">
                    <p>When you generate campaign content in the Workspace, the AI uses your brand profile to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Match your brand voice and tone across all platforms</li>
                      <li>Use your brand colors in visual suggestions</li>
                      <li>Reference your mission and values in copy</li>
                      <li>Align messaging with your target audience</li>
                      <li>Differentiate from competitor positioning</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : (
          /* Empty State */
          <Card className="udon-card border-dashed border-[var(--border)] bg-transparent">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-secondary)] text-[13px] font-medium mb-1">No brand profile yet</p>
              <p className="text-[var(--text-muted)] text-xs max-w-sm">
                Enter your website URL above to automatically extract your brand colors, fonts, tone, and other identity elements
              </p>
            </CardContent>
          </Card>
        )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm udon-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-[var(--text)]" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain bg-white"
            />
            {lightboxImage.alt && (
              <p className="text-center text-white text-sm mt-3 drop-shadow">{lightboxImage.alt}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
