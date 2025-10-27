import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class WikimediaAdapter implements MediaAdapter {
  isEnabled(): boolean {
    return process.env.ENABLE_MEDIA_WIKIMEDIA === 'true';
  }

  async fetchImage(params: { file?: string; url?: string; query?: string; width?: number }): Promise<ImageResult> {
    if (!this.isEnabled()) {
      throw new Error('Wikimedia is not enabled');
    }

    let imageUrl: string;

    if (params.url) {
      imageUrl = params.url;
    } else if (params.query) {
      // Search Wikimedia Commons by query
      const searchResponse = await fetch(
        `https://commons.wikimedia.org/w/api.php?` +
        `action=query&list=search&srsearch=${encodeURIComponent(params.query)}` +
        `&srnamespace=6&srlimit=1&format=json`
      );
      const searchData = await searchResponse.json();
      
      if (!searchData.query.search || searchData.query.search.length === 0) {
        throw new Error('No images found on Wikimedia Commons');
      }
      
      const fileName = searchData.query.search[0].title;
      const fileResponse = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileName)}` +
        `&prop=imageinfo&iiprop=url&format=json`
      );
      const fileData = await fileResponse.json();
      const pages = fileData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (!pages[pageId].imageinfo) {
        throw new Error('File info not found on Wikimedia Commons');
      }
      
      imageUrl = pages[pageId].imageinfo[0].url;
      
      if (params.width) {
        imageUrl = imageUrl.replace(/\/\d+px-/, `/${params.width}px-`);
      }
    } else if (params.file) {
      const fileName = params.file.replace(/ /g, '_');
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`);
      const data = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (!pages[pageId].imageinfo) {
        throw new Error('File not found on Wikimedia Commons');
      }

      imageUrl = pages[pageId].imageinfo[0].url;
      
      if (params.width) {
        imageUrl = imageUrl.replace(/\/\d+px-/, `/${params.width}px-`);
      }
    } else {
      throw new Error('Either file, url, or query must be provided');
    }

    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return {
      buffer,
      contentType,
      ttl: DEFAULT_TTL.long,
    };
  }

  getAttribution(params: { file?: string }): AttributionInfo {
    return {
      provider: 'Wikimedia Commons',
      attributionText: params.file || 'Wikimedia Commons',
      attributionUrl: params.file ? `https://commons.wikimedia.org/wiki/File:${params.file.replace(/ /g, '_')}` : 'https://commons.wikimedia.org',
      license: 'Various CC licenses'
    };
  }
}
