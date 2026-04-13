import {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  SearchRequest,
  SearchResults
} from "@paperback/types"

const BASE_URLS = [
  "https://manatoki469.net",
  "https://newtoki469.com"
]

export class Toki extends Source {

  base: string = BASE_URLS[0]

  constructor() {
    super({
      id: "toki",
      name: "Toki",
      baseUrl: BASE_URLS[0],
      language: "ko"
    })
  }

  // 🔥 살아있는 도메인 찾기
  async getBaseUrl(): Promise<string> {
    for (const url of BASE_URLS) {
      try {
        const request = createRequestObject({
          url,
          method: "GET"
        })
        await this.requestManager.schedule(request, 1)
        this.base = url
        return url
      } catch (e) {}
    }
    return this.base
  }

  // 🔹 홈
  async getHomePageSections(): Promise<HomeSection[]> {
    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: base,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const regex = /href="\/comic\/(\d+)".*?src="([^"]+)".*?title="([^"]+)"/g

    let match
    const items = []

    while ((match = regex.exec(html)) !== null) {
      items.push({
        id: match[1],
        image: match[2],
        title: match[3]
      })
    }

    return [{
      id: "latest",
      title: "최신",
      items
    }]
  }

  // 🔹 검색
  async getSearchResults(query: SearchRequest): Promise<SearchResults> {
    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: `${base}/search?keyword=${encodeURIComponent(query.title!)}`,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const regex = /href="\/comic\/(\d+)".*?src="([^"]+)".*?title="([^"]+)"/g

    let match
    const results = []

    while ((match = regex.exec(html)) !== null) {
      results.push({
        id: match[1],
        image: match[2],
        title: match[3]
      })
    }

    return { results }
  }

  // 🔹 상세
  async getMangaDetails(mangaId: string): Promise<Manga> {
    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: `${base}/comic/${mangaId}`,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || ""

    return {
      id: mangaId,
      titles: [title],
      image: "",
      status: 1
    }
  }

  // 🔹 챕터
  async getChapters(mangaId: string): Promise<Chapter[]> {
    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: `${base}/comic/${mangaId}`,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const regex = /href="\/comic\/(\d+)"/g

    let match
    const chapters = []
    let num = 1

    while ((match = regex.exec(html)) !== null) {
      chapters.push({
        id: match[1],
        chapNum: num++
      })
    }

    return chapters.reverse()
  }

  // 🔥 뷰어
  async getChapterDetails(
    mangaId: string,
    chapterId: string
  ): Promise<ChapterDetails> {

    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: `${base}/comic/${chapterId}`,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const imageRegex = /https?:\/\/[^"]+\.(jpg|jpeg|png|webp)/g
    const images = html.match(imageRegex) || []

    return {
      id: chapterId,
      mangaId,
      pages: images
    }
  }
}
