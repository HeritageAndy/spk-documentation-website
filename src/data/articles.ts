export type ArticleCategory =
  | "Published Articles"
  | "Reports"
  | "Presentations"
  | "Books / Chapters"
  | "Media / News";

export type ArticleRecord = {
  title: string;
  authors: string;
  year: string;
  category: ArticleCategory;
  citation: string;
  summary: string;
  thumbnail: string;
  pdfUrl: string;
  externalUrl: string;
};

export const articleCategories: ArticleCategory[] = [
  "Published Articles",
  "Reports",
  "Presentations",
  "Books / Chapters",
  "Media / News"
];

export const articles: ArticleRecord[] = [
  {
    title: "Demo Published Article Record",
    authors: "Content pending",
    year: "Content pending",
    category: "Published Articles",
    citation: "Placeholder citation. Replace with verified publication information.",
    summary: "Demo record for layout testing only.",
    thumbnail: "",
    pdfUrl: "",
    externalUrl: ""
  },
  {
    title: "Demo Report Record",
    authors: "Content pending",
    year: "Content pending",
    category: "Reports",
    citation: "Placeholder citation. Replace with verified report information.",
    summary: "Demo record for layout testing only.",
    thumbnail: "",
    pdfUrl: "",
    externalUrl: ""
  },
  {
    title: "Demo Presentation Record",
    authors: "Content pending",
    year: "Content pending",
    category: "Presentations",
    citation: "Placeholder citation. Replace with verified presentation information.",
    summary: "Demo record for layout testing only.",
    thumbnail: "",
    pdfUrl: "",
    externalUrl: ""
  }
];
