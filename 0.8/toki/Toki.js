import { Source } from "@paperback/types"

const BASE_URLS = [
  "https://manatoki469.net",
  "https://newtoki469.com"
]

export class Toki extends Source {

  constructor() {
    super({
      id: "toki",
      name: "Toki",
      baseUrl: BASE_URLS[0],
      language: "ko"
    })
    this.base = BASE_URLS[0]
  }

  async getBaseUrl() {
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

  async getHomePageSections() {
    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: base,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const regex = /href="\/comic\/(\d+)".*?title="([^"]+)"/g

    let match
    const items = []

    while ((match = regex.exec(html)) !== null) {
      items.push({
        id: match[1],
        title: match[2]
      })
    }

    return [{
      id: "latest",
      title: "최신",
      items
    }]
  }

  async getSearchResults(query) {
    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: `${base}/search?keyword=${encodeURIComponent(query.title || "")}`,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const regex = /href="\/comic\/(\d+)".*?title="([^"]+)"/g

    let match
    const results = []

    while ((match = regex.exec(html)) !== null) {
      results.push({
        id: match[1],
        title: match[2]
      })
    }

    return { results }
  }

  async getMangaDetails(mangaId) {
    const base = await this.getBaseUrl()

    return {
      id: mangaId,
      titles: [mangaId],
      image: "",
      status: 1
    }
  }

  async getChapters(mangaId) {
    const base = await this.getBaseUrl()

    const request = createRequestObject({
      url: `${base}/comic/${mangaId}`,
      method: "GET"
    })

    const response = await this.requestManager.schedule(request, 1)
    const html = response.data

    const regex = /comic\/(\d+)/g

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

  async getChapterDetails(mangaId, chapterId) {
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
