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
