export type ProjectRecord = {
  title: string;
  period: string;
  summary: string;
  thumbnail: string;
  participatingOrganizations: string[];
  relatedOutputs: string[];
  externalLink: string;
  category: "Research" | "Conservation" | "Human Resource Development";
};

export const projects: ProjectRecord[] = [
  {
    title: "Demo Research Project",
    period: "Content pending",
    summary: "Placeholder summary. Replace with verified research project information.",
    thumbnail: "",
    participatingOrganizations: ["Content pending"],
    relatedOutputs: ["Content pending"],
    externalLink: "",
    category: "Research"
  },
  {
    title: "Demo Conservation Project",
    period: "Content pending",
    summary: "Placeholder summary. Replace with verified conservation project information.",
    thumbnail: "",
    participatingOrganizations: ["Content pending"],
    relatedOutputs: ["Content pending"],
    externalLink: "",
    category: "Conservation"
  },
  {
    title: "Demo Human Resource Development Project",
    period: "Content pending",
    summary: "Placeholder summary. Replace with verified training or education project information.",
    thumbnail: "",
    participatingOrganizations: ["Content pending"],
    relatedOutputs: ["Content pending"],
    externalLink: "",
    category: "Human Resource Development"
  }
];
