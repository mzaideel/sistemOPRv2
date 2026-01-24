
export interface ActivityImage {
  id: string;
  url: string;
  caption: string;
  isLandscape: boolean;
}

export interface OPRData {
  id: string;
  programName: string;
  date: string;
  venue: string;
  targetGroup: string;
  objectives: string[];
  impact: string;
  reporterName: string;
  reporterPosition: string;
  images: ActivityImage[];
  category: 'Pentadbiran' | 'Kurikulum' | 'Hal Ehwal Murid' | 'Kokurikulum' | 'Lain-lain';
  createdAt: number;
}

export type AppTab = 'dashboard' | 'list' | 'new' | 'view';
