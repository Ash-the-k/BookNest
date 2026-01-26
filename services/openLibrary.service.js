import axios from "axios";

/**
 * Open Library base URLs
 */
const OL_BASE_URL = "https://openlibrary.org";
const OL_COVERS_URL = "https://covers.openlibrary.org";

/**
 * Search books by text query (title / author)
 */
export const searchBooks = async (query, page = 1, limit = 8) => {
  if (!query) return [];

  try {
    // 1️⃣ Search Open Library
    const response = await axios.get(`${OL_BASE_URL}/search.json`, {
      params: {
        q: query,
        page,
        limit,
      },
    });

    const docs = response.data?.docs;

    // 2️⃣ Normalize base results (SYNC)
    const baseResults = docs
      .map((doc) => {
        if (!doc.title || !doc.key) return null;

        const work_olid = doc.key.replace("/works/", "");

        // Edition OLID: prefer edition_key, fallback to cover_edition_key
        const edition_olid =
          doc.edition_key?.[0] ?? doc.cover_edition_key ?? null;

        const author = doc.author_name?.[0] ?? "Unknown author";

        return {
          title: doc.title,
          author,
          work_olid,
          edition_olid,
          cover_urls: edition_olid ? getCoverUrls(edition_olid) : null,
        };
      })
      .filter(Boolean);

    // 3️⃣ Attach ratings (ASYNC, PARALLEL)
    const resultsWithRatings = await Promise.all(
      baseResults.map(async (book) => {
        const rating = await getWorkRating(book.work_olid);

        return {
          ...book,
          ol_rating: rating,
        };
      }),
    );

    return resultsWithRatings;
  } catch (err) {
    console.error("OpenLibrary search failed:", err.message);
    return [];
  }
};

/**
 * Get Internet Archive availability (edition-level)
 */
export const getArchiveAvailability = async (editionOlid) => {
  if (!editionOlid) return null;

  try {
    const response = await axios.get(
      "https://openlibrary.org/api/books",
      {
        params: {
          bibkeys: `OLID:${editionOlid}`,
          format: "json"
        }
      }
    );

    const data = response.data?.[`OLID:${editionOlid}`];

    if (!data || data.preview === "noview") {
      return null;
    }

    return {
      preview: data.preview,
      url: data.preview_url
    };
  } catch (err) {
    return null;
  }
};

/**
 * Helper: Build cover URLs from edition OLID
 */
export const getCoverUrls = (editionOlid) => {
  if (!editionOlid) return null;

  return {
    small: `${OL_COVERS_URL}/b/OLID/${editionOlid}-S.jpg`,
    medium: `${OL_COVERS_URL}/b/OLID/${editionOlid}-M.jpg`,
    large: `${OL_COVERS_URL}/b/OLID/${editionOlid}-L.jpg`,
  };
};

/**
 * Helper: Build rating, count from work OLID
 */
export const getWorkRating = async (workOlid) => {
  if (!workOlid) return null;

  try {
    const response = await axios.get(
      `${OL_BASE_URL}/works/${workOlid}/ratings.json`,
    );

    const summary = response.data?.summary;

    if (!summary) return null;

    return {
      average: summary.average,
      count: summary.count,
    };
  } catch (err) {
    return null;
  }
};

export const getWorkDescription = async (workOlid) => {
  if (!workOlid) return null;

  try {
    const res = await axios.get(
      `https://openlibrary.org/works/${workOlid}.json`
    );

    const desc = res.data?.description;

    if (!desc) return null;

    if (typeof desc === "string") {
      return desc;
    }

    return desc.value ?? null;
  } catch {
    return null;
  }
};
