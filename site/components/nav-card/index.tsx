"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { CLASSES } from "./constants";
import type { NavCardProps } from "./types";

function PreviewPlaceholder() {
  return <div className={CLASSES.placeholder}>Preview</div>;
}

export function NavCard({
  title,
  href,
  previewLight,
  previewDark,
}: NavCardProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const lightSrc = previewLight || previewDark;
  const darkSrc = previewDark || previewLight;
  const isDark = mounted && resolvedTheme === "dark";
  const preview = isDark ? darkSrc : lightSrc;

  const previewContent = preview ? (
    <Image
      src={preview}
      alt={title}
      width={400}
      height={225}
      className={CLASSES.image}
    />
  ) : (
    <PreviewPlaceholder />
  );

  return (
    <button type="button" onClick={handleClick} className={CLASSES.card}>
      <div className={CLASSES.imageWrapper}>{previewContent}</div>
      <div className={CLASSES.content}>
        <h3 className={CLASSES.title}>{title}</h3>
      </div>
    </button>
  );
}

export type { NavCardProps } from "./types";
