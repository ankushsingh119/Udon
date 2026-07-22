import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface BrandPDFData {
  name: string;
  url: string;
  missionStatement?: string;
  tagline?: string;
  description?: string;
  targetAudience?: string;
  brandValues?: string[];
  competitors?: string[];
  imageryStyle?: string[];
  tone: string[];
  colors: { name: string; hex: string }[];
  fonts: { name: string; category: string }[];
  logos?: { url: string; type: string; format: string }[];
  brandImages?: { url: string; alt: string; type: string }[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

async function loadPdfFonts(doc: jsPDF) {
  doc.setFont("helvetica", "normal");
}

export async function generateBrandPDF(
  data: BrandPDFData,
  logoImages?: Map<string, string>,
  brandImageUrls?: Map<string, string>
): Promise<void> {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  await loadPdfFonts(doc);

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const drawSectionTitle = (title: string) => {
    checkPage(20);
    y += 4;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y - 2, contentWidth, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(title, margin + 4, y + 5);
    y += 14;
  };

  const drawField = (label: string, value: string, multiLine = false) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label.toUpperCase(), margin + 2, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);

    if (multiLine) {
      const lines = doc.splitTextToSize(value, contentWidth - 4);
      checkPage(lines.length * 5 + 8);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5;
    } else {
      checkPage(8);
      doc.text(value, margin + 2, y);
    }
    y += 6;
  };

  const drawBadges = (items: string[]) => {
    let x = margin + 2;
    for (const item of items) {
      const textWidth = doc.getTextWidth(item) + 8;
      if (x + textWidth > pageWidth - margin) {
        x = margin + 2;
        y += 8;
      }
      checkPage(10);
      doc.setFillColor(255, 240, 240);
      doc.roundedRect(x, y - 3, textWidth, 6, 1, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(180, 80, 90);
      doc.text(item, x + 4, y);
      x += textWidth + 3;
    }
    y += 8;
  };

  // ===== HEADER =====
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(30, 30, 30);
  y = 22;
  doc.text(data.name, margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(data.url.replace(/^https?:\/\//, "").replace(/\/$/, ""), margin, y);
  if (data.tagline) {
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`"${data.tagline}"`, margin, y);
  }
  y = 60;

  // ===== MISSION =====
  if (data.missionStatement) {
    drawSectionTitle("Mission Statement");
    drawField("Mission", data.missionStatement, true);
  }

  // ===== BRAND VALUES =====
  if (data.brandValues && data.brandValues.length > 0) {
    drawSectionTitle("Brand Values");
    drawBadges(data.brandValues);
  }

  // ===== TARGET AUDIENCE =====
  if (data.targetAudience) {
    drawSectionTitle("Target Audience");
    drawField("Audience", data.targetAudience, true);
  }

  // ===== VISUAL IDENTITY: COLORS =====
  drawSectionTitle("Color Palette");
  const colorSize = 18;
  const colorGap = 4;
  const cols = Math.floor(contentWidth / (colorSize + colorGap));
  let cx = margin + 2;
  for (const color of data.colors) {
    checkPage(colorSize + 14);
    const rgb = hexToRgb(color.hex);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(cx, y, colorSize, colorSize, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(color.name, cx + colorSize / 2, y + colorSize + 4, { align: "center" });
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(6);
    doc.text(color.hex, cx + colorSize / 2, y + colorSize + 7, { align: "center" });
    cx += colorSize + colorGap;
    if (cx + colorSize > pageWidth - margin) {
      cx = margin + 2;
      y += colorSize + 12;
    }
  }
  y += colorSize + 14;

  // ===== TYPOGRAPHY =====
  drawSectionTitle("Typography");
  for (const font of data.fonts) {
    checkPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(font.name, margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(font.category, margin + 2 + doc.getTextWidth(font.name) + 4, y);
    y += 8;
  }
  y += 4;

  // ===== TONE =====
  drawSectionTitle("Brand Tone");
  drawBadges(data.tone);

  // ===== IMAGERY STYLE =====
  if (data.imageryStyle && data.imageryStyle.length > 0) {
    drawSectionTitle("Imagery Style");
    drawBadges(data.imageryStyle);
  }

  // ===== BRAND VALUES / STRATEGY =====
  if (data.competitors && data.competitors.length > 0) {
    drawSectionTitle("Competitors");
    drawBadges(data.competitors);
  }

  // ===== BRAND IMAGES (render as thumbnails) =====
  if (data.brandImages && data.brandImages.length > 0) {
    drawSectionTitle("Brand Imagery");
    const imgSize = 40;
    const imgGap = 4;
    let ix = margin + 2;
    for (const img of data.brandImages.slice(0, 6)) {
      const dataUrl = brandImageUrls?.get(img.url);
      if (dataUrl) {
        checkPage(imgSize + 10);
        try {
          doc.addImage(dataUrl, "JPEG", ix, y, imgSize, imgSize * 0.6);
        } catch { /* skip */ }
        ix += imgSize + imgGap;
        if (ix + imgSize > pageWidth - margin) {
          ix = margin + 2;
          y += imgSize + 10;
        }
      }
    }
    y += imgSize + 10;
  }

  // ===== LOGOS (render as thumbnails) =====
  if (data.logos && data.logos.length > 0) {
    drawSectionTitle("Brand Logos");
    const logoSize = 25;
    const logoGap = 5;
    let lx = margin + 2;
    for (const logo of data.logos.slice(0, 4)) {
      const dataUrl = logoImages?.get(logo.url);
      if (dataUrl) {
        checkPage(logoSize + 10);
        try {
          doc.addImage(dataUrl, "PNG", lx, y, logoSize, logoSize);
        } catch { /* skip */ }
        lx += logoSize + logoGap;
        if (lx + logoSize > pageWidth - margin) {
          lx = margin + 2;
          y += logoSize + 10;
        }
      }
    }
    y += logoSize + 10;
  }

  // ===== FOOTER =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `Generated by Udon Brand Profile • ${data.url.replace(/^https?:\/\//, "")} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  const filename = `${data.name.replace(/[^a-zA-Z0-9]/g, "_")}_Brand_Profile.pdf`;
  doc.save(filename);
}
