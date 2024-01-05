export interface CivitAIModels {
    items: Item[];
    metadata: Metadata3;
  }
  
  export interface Item {
    id: number;
    name: string;
    description: string;
    type: string;
    poi: boolean;
    nsfw: boolean;
    allowNoCredit: boolean;
    allowCommercialUse: string;
    allowDerivatives: boolean;
    allowDifferentLicense: boolean;
    stats: Stats;
    creator: Creator;
    tags: string[];
    modelVersions: ModelVersion[];
  }
  
  export interface Stats {
    downloadCount: number;
    favoriteCount: number;
    commentCount: number;
    ratingCount: number;
    rating: number;
    tippedAmountCount: number;
  }
  
  export interface Creator {
    username: string;
    image: string;
  }
  
  export interface ModelVersion {
    id: number;
    modelId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    publishedAt: string;
    trainedWords: string[];
    trainingStatus: any;
    trainingDetails: any;
    baseModel: string;
    baseModelType: string;
    earlyAccessTimeFrame: number;
    description: string;
    vaeId: any;
    stats: Stats2;
    files: File[];
    images: Image[];
    downloadUrl: string;
  }
  
  export interface Stats2 {
    downloadCount: number;
    ratingCount: number;
    rating: number;
  }
  
  export interface File {
    id: number;
    sizeKB: number;
    name: string;
    type: string;
    metadata: Metadata;
    pickleScanResult: string;
    pickleScanMessage: string;
    virusScanResult: string;
    virusScanMessage: any;
    scannedAt: string;
    hashes: Hashes;
    downloadUrl: string;
    primary: boolean;
  }
  
  export interface Metadata {
    fp: string;
    size: string;
    format: string;
  }
  
  export interface Hashes {
    AutoV1: string;
    AutoV2: string;
    SHA256: string;
    CRC32: string;
    BLAKE3: string;
  }
  
  export interface Image {
    id: number;
    url: string;
    nsfw: string;
    width: number;
    height: number;
    hash: string;
    type: string;
    metadata: Metadata2;
    meta: Meta;
  }
  
  export interface Metadata2 {
    hash: string;
    width: number;
    height: number;
  }

  export interface Meta {
    ENSD: string;
    Size: string;
    seed: number;
    steps: number;
    prompt: string;
    sampler: string;
    cfgScale: number;
    "Clip skip": string;
    resources: Resource[];
    "Model hash": string;
    "Hires steps": string;
    "Hires upscale": string;
    "Hires upscaler": string;
    negativePrompt: string;
    "Denoising strength": string;
    "Variation seed"?: string;
    "Variation seed strength"?: string;
  }
  
  export interface Resource {
    name: string;
    type: string;
    weight: number;
  }
  
  export interface Metadata3 {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    nextPage: string;
  }

  export interface GetLorasOptions {
    page?: number;
    limit?: number;
    name?: string;
  }

  export interface ModelsIds {
    id: number;
    name: string;
}