// Editorial lookbook chapters (PRD-002 SF-1).
//
// The backend has no lookbook operations (contract doc §2, backend gap), so
// chapters are static content. Each entry keeps the shape the lookbook
// components already render:
// {
//   _id: "chapter-slug",          // used in /lookbook/[slug]
//   name, subName, description,   // description is HTML (sanitised)
//   assets: [{ path, altText }],  // first asset is the cover
//   sections: [{ imageUrl, videourl, paragraph }], // up to 7
//   products: [],                 // optional, product summaries
// }
// While the list is empty, /lookbook shows a "coming soon" state.
export const LookbookChapters = [];
