/**
 * /material-index (live site design, main 2026-05): static content, so the
 * page is prerendered.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import MaterialIndexView from "@/views/MaterialIndexView";
import { MATERIALS } from "@/data/materials";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const TITLE = "Material Index – DeVeSheDreams";
const DESCRIPTION =
  "A catalogue of cloth: where each DeVeSheDreams fabric comes from, how it behaves, and what we build with it.";

const META = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["DeVeSheDreams materials", "fabrics", "material index"],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const metadata = toMetadata(META, "/material-index");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/material-index" />
      <MaterialIndexView materials={MATERIALS} />
    </>
  );
}
