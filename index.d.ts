declare namespace metadata {
  export interface MetadataStatistics {
    viewCount: number;
    likeCount?: number;
    dislikeCount?: number;
    favoriteCount: number;
    commentCount: number;
  }

  export interface Metadata {
    duration?: string;
    statistics: MetadataStatistics;
  }

  export interface MetadataHelper {
    includeDuration() : MetadataHelper;
    includeStatistics() : MetadataHelper;
    fetch(apiKey: string, videoIds: string[]) : Promise<{ [key:string]: Metadata }>
  }
}

declare namespace search {
  export interface YouTubeMetadataOptions {
    duration?: boolean;
    statistics?: boolean;
  }

  export interface YouTubeSearchOptions {
    fields?: string;
    channelId?: string;
    channelType?: string;
    eventType?: string;
    forContentOwner?: boolean;
    forDeveloper?: boolean;
    forMine?: boolean;
    location?: string;
    locationRadius?: string;
    maxResults?: number;
    onBehalfOfContentOwner?: string;
    order?: string;
    part?: string;
    pageToken?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    regionCode?: string;
    relatedToVideoId?: string;
    relevanceLanguage?: string;
    safeSearch?: string;
    topicId?: string;
    type?: string;
    videoCaption?: string;
    videoCategoryId?: string;
    videoDefinition?: string;
    videoDimension?: string;
    videoDuration?: string;
    videoEmbeddable?: string;
    videoLicense?: string;
    videoSyndicated?: string;
    videoType?: string;
    key?: string;
    metadata?: YouTubeMetadataOptions
  }

  export interface YouTubeThumbnail {
    url: string;
    width: number;
    height: number;
  }

  export interface YouTubeSearchResultThumbnails {
    default?: YouTubeThumbnail;
    medium?: YouTubeThumbnail;
    high?: YouTubeThumbnail;
    standard?: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
  }

  export interface YouTubeSearchResults {
    id: string;
    link: string;
    kind: string;
    publishedAt: string;
    channelTitle: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeSearchResultThumbnails;
    duration?: string;
    statistics?: metadata.MetadataStatistics
  }

  export interface YouTubeSearchPageResults {
    totalResults: number;
    resultsPerPage: number;
    nextPageToken: string;
    prevPageToken: string;
  }
}

declare function search(
  term: string,
  opts: search.YouTubeSearchOptions,
  cb?: (err: Error, result?: search.YouTubeSearchResults[], pageInfo?: search.YouTubeSearchPageResults) => void
): Promise<{results: search.YouTubeSearchResults[], pageInfo: search.YouTubeSearchPageResults}>;


export {
  search,
  metadata
}
