export type EditionStatus = "draft" | "published";

export type EditionRecord = {
  id: string;
  title: string;
  headline: string;
  summary: string;
  pageCount: number;
  publishedAt: string;
  status: EditionStatus;
  isCurrent: boolean;
};

export type MagazineCatalog = {
  currentEditionId: string | null;
  editions: EditionRecord[];
};

export type EditionMetaFile = {
  id: string;
  title: string;
  headline: string;
  summary: string;
  pageCount: number;
  publishedAt: string;
  status: EditionStatus;
  processedAt: string;
  cacheVersion?: string;
  assetPipeline?: number;
  storageRoot?: string;
};
