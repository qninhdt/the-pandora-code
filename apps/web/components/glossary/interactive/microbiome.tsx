"use client";

import { useTranslations } from "next-intl";
import { ConceptGradient } from "./shared/concept-gradient";

export default function Microbiome() {
  const t = useTranslations("viz.microbiome");
  return (
    <ConceptGradient
      title={t("title")}
      category={t("category")}
      info={t("info")}
      left={t("left")}
      middle={t("middle")}
      right={t("right")}
      control={t("control")}
      low={t("low")}
      high={t("high")}
      caption={t("caption")}
    />
  );
}
