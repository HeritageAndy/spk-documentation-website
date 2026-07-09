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

export type ProjectPageSection = {
  category: "Research" | "Conservation" | "Human Resource Development";
  title: string;
  sourceUrl: string;
  sourceLabel: string;
  image: string;
  imageAlt: string;
  paragraphs: string[];
  points: string[];
};

export const projectPageSections: ProjectPageSection[] = [
  {
    category: "Research",
    title: "Research on Sambor Prei Kuk",
    sourceUrl: "https://www.shimoda-lab.org/spk-project/research-on-spk/",
    sourceLabel: "Research on SPK, Shimoda Laboratory",
    image: "/images/project/research-excavation.png",
    imageAlt: "Archaeological research activity at Sambor Prei Kuk",
    paragraphs: [
      "Research at Sambor Prei Kuk has been developed as a long-term project since 1998 under a team led by Prof. Takeshi Nakagawa of Waseda University.",
      "The research aims to understand the urban structure of the archaeological site and clarify its historical perspective through fieldwork and cross-disciplinary documentation."
    ],
    points: [
      "Field survey, measurement, geomorphological survey, and documentation of the wider monument group.",
      "Preparation of inventories, artifact records, decorative element records, old photograph records, and architectural drawings.",
      "Archaeological investigation at temple and city areas to study original conditions and historical change.",
      "Material, architectural, dating, stylistic, and artifact studies."
    ]
  },
  {
    category: "Conservation",
    title: "Research History and Conservation of SPK",
    sourceUrl: "https://www.shimoda-lab.org/spk-project/conservation-of-spk/",
    sourceLabel: "Conservation of SPK, Shimoda Laboratory",
    image: "/images/project/conservation-fieldwork.jpg",
    imageAlt: "Conservation work reference image from the SPK project",
    paragraphs: [
      "The conservation history of Sambor Prei Kuk includes early records, surveys, excavations, emergency care, and long-term collaborative restoration work.",
      "From the mid-1990s onward, conservation activity restarted, followed by cooperation between Cambodian authorities and Japanese experts from the early 2000s."
    ],
    points: [
      "Early surveys and records were made during the French Indochina period.",
      "Conservation work after the 1990s included vegetation control, clearing collapsed bricks, backfilling looted holes, and structural support.",
      "The Sambor Prei Kuk Conservation Project has continued activities mainly in the temple zone.",
      "Restoration of brick structures and sandstone pedestals contributed to technical development and field training."
    ]
  },
  {
    category: "Human Resource Development",
    title: "Human Resource Development in SPK",
    sourceUrl: "https://www.shimoda-lab.org/spk-project/human-resource-development/",
    sourceLabel: "Human Resource Development in SPK, Shimoda Laboratory",
    image: "/images/project/training-fieldwork.png",
    imageAlt: "Training and fieldwork activity at Sambor Prei Kuk",
    paragraphs: [
      "Human resource development has supported the training of experts and local participants for monument research, conservation, restoration, and interpretation.",
      "Programs have included long-term on-site job training, short-term university student programs, local villager training, and community-focused activities."
    ],
    points: [
      "Long-term training taught restoration, conservation, architectural survey, and archaeological survey methods.",
      "Short-term programs brought Cambodian and Japanese university students into field-based architectural and archaeological training.",
      "Additional programs worked with local villagers, guides, high school students, and local communities.",
      "Training activities connected conservation practice with interpretation and public engagement."
    ]
  }
];
