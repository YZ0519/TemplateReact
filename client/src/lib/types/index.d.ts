export type TechStackItem = {
  id: string;
  name: string;
  category: string;
  displayOrder: number;
};

export type ProjectFeature = {
  id: string;
  description: string;
  displayOrder: number;
};

export type ProjectScreenshot = {
  id: string;
  url: string;
  publicId: string;
  caption?: string;
  displayOrder: number;
};

export type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  displayOrder: number;
  techStacks: TechStackItem[];
  heroScreenshotUrl?: string;
};

export type ProjectDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  displayOrder: number;
  techStacks: TechStackItem[];
  features: ProjectFeature[];
  screenshots: ProjectScreenshot[];
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  id: string;
  displayName: string;
  bio?: string;
  imageUrl?: string;
  followersCount?: number;
  followingCount?: number;
  following?: boolean;
};

export type Photo = {
  id: string;
  url: string;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  imageUrl?: string;
};
