export type MonumentRecord = {
  id: string;
  name: string;
  zone: string;
  thumbnail: string;
  shortDescription: string;
  tags: string[];
};

export const monuments: MonumentRecord[] = [
  {
    id: "demo-monument-01",
    name: "Demo Monument 01",
    zone: "Content pending",
    thumbnail: "",
    shortDescription: "Placeholder monument card. Replace with verified site information.",
    tags: ["Demo", "Placeholder"]
  },
  {
    id: "demo-monument-02",
    name: "Demo Monument 02",
    zone: "Content pending",
    thumbnail: "",
    shortDescription: "Placeholder monument card. Replace with verified site information.",
    tags: ["Demo", "Content pending"]
  },
  {
    id: "demo-monument-03",
    name: "Demo Monument 03",
    zone: "Content pending",
    thumbnail: "",
    shortDescription: "Placeholder monument card. Replace with verified site information.",
    tags: ["Demo", "Placeholder"]
  },
  {
    id: "demo-monument-04",
    name: "Demo Monument 04",
    zone: "Content pending",
    thumbnail: "",
    shortDescription: "Placeholder monument card. Replace with verified site information.",
    tags: ["Demo", "Content pending"]
  }
];
