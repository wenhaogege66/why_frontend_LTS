import axios from "axios";

// const API_BASE_URL = 'http://10.214.241.127:8000';
const API_BASE_URL = "http://localhost:8000";
// 使用相同的axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除token并跳转到登录页
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Network error");
  } else {
    console.error("Unexpected Error:", error);
    throw new Error("An unexpected error occurred");
  }
};

// 定义统一搜索的参数和返回类型
export interface UnifiedSearchParams {
  query: string;
}

// 定义普通搜索的参数
export interface NormalSearchParams {
  keyword: string;
}

// 定义统一搜索的返回结果结构（包含所有可能的分类）
export interface UnifiedSearchResults {
  byDescription?: SearchResponse; // AI搜索-描述结果
  byMood?: SearchResponse; // AI搜索-心情结果
  byTitle?: SearchResponse; // AI搜索-主题结果
}

// 定义普通搜索的返回结果结构
export interface NormalSearchResults {
  songs?: Song[]; // 歌曲搜索结果
  artists?: ArtistResult[]; // 歌手搜索结果
  albums?: AlbumResult[]; // 专辑搜索结果
}

interface DescribeSearchParams {
  describe: string; // 歌曲描述
}

// 2. 定义返回数据中的子 Interface
interface Artist {
  id: number;
  name: string;
  tns: string[]; // 翻译名
  alias: string[]; // 别名
}

// 普通搜索中的歌手结果
export interface ArtistResult {
  id: number;
  name: string;
  picUrl: string;
  alias: string[];
  albumSize: number;
  mvSize: number;
}

interface Album {
  id: number;
  name: string;
  picUrl: string; // 封面图片 URL
  tns: string[]; // 翻译名
  pic_str?: string; // 可能有的字段
  pic: number; // 图片 ID
}

// 普通搜索中的专辑结果
export interface AlbumResult {
  name: string;
  id: number;
  size: number;
  picUrl: string;
  publishTime: number;
  company: string;
  alias: string[];
  artists: {
    name: string;
    id: number;
    picUrl: string;
  }[];
}

export interface Song {
  name: string;
  id: number;
  ar: Artist[]; // 艺术家列表
  al: Album; // 专辑信息
  publishTime: number; // 发布时间戳
}

export interface SearchResponse {
  code: number; // 状态码，如 200
  message: string; // 状态信息，如 "success"
  data: Song[]; // 歌曲列表
}

// 普通搜索响应接口
export interface NormalSearchResponse {
  code: number;
  message: string;
  data: Song[] | ArtistResult[] | AlbumResult[];
}

/**
 * 按歌名搜索（普通搜索）
 */
export const searchByTitle = async (
  params: NormalSearchParams
): Promise<NormalSearchResponse> => {
  try {
    const response = await api.get<NormalSearchResponse>(
      "/api/search/bytitle/",
      {
        params: {
          keyword: params.keyword,
        },
      }
    );

    if (response.data.code !== 200) {
      const errorMessage =
        response.data.message ||
        `Backend returned non-200 code: ${response.data.code}`;
      console.error("Backend Logical Error:", response.data.code, errorMessage);
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * 按歌手搜索（普通搜索）
 */
export const searchByArtist = async (
  params: NormalSearchParams
): Promise<NormalSearchResponse> => {
  try {
    const response = await api.get<NormalSearchResponse>(
      "/api/search/byartist/",
      {
        params: {
          keyword: params.keyword,
        },
      }
    );

    if (response.data.code !== 200) {
      const errorMessage =
        response.data.message ||
        `Backend returned non-200 code: ${response.data.code}`;
      console.error("Backend Logical Error:", response.data.code, errorMessage);
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * 按专辑搜索（普通搜索）
 */
export const searchByAlbum = async (
  params: NormalSearchParams
): Promise<NormalSearchResponse> => {
  try {
    const response = await api.get<NormalSearchResponse>(
      "/api/search/byalbum/",
      {
        params: {
          keyword: params.keyword,
        },
      }
    );

    if (response.data.code !== 200) {
      const errorMessage =
        response.data.message ||
        `Backend returned non-200 code: ${response.data.code}`;
      console.error("Backend Logical Error:", response.data.code, errorMessage);
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * 普通搜索（综合搜索歌曲、歌手、专辑）
 */
export const normalSearch = async (
  params: NormalSearchParams
): Promise<NormalSearchResults> => {
  const apiCalls = {
    songs: () => searchByTitle(params),
    artists: () => searchByArtist(params),
    albums: () => searchByAlbum(params),
  };

  const keys = Object.keys(apiCalls) as (keyof typeof apiCalls)[];
  const promises = keys.map((key) => apiCalls[key]());

  const results: NormalSearchResults = {};

  try {
    const settledResults = await Promise.allSettled(promises);

    settledResults.forEach((result, index) => {
      const key = keys[index];

      if (result.status === "fulfilled") {
        if (key === "songs") {
          results.songs = result.value.data as Song[];
        } else if (key === "artists") {
          results.artists = result.value.data as ArtistResult[];
        } else if (key === "albums") {
          results.albums = result.value.data as AlbumResult[];
        }
      } else {
        console.error(`普通搜索: ${key} 失败！原因：`, result.reason);
      }
    });

    return results;
  } catch (error) {
    console.error("普通搜索意外错误：", error);
    throw error;
  }
};

/**
 * 按描述搜索
 * @param params
 */
export const describeSearch = async (
  params: DescribeSearchParams // 函数接收搜索参数
): Promise<SearchResponse> => {
  // 使用 Promise 包裹返回类型，表示异步操作
  try {
    // 发起 GET 请求，并将 params 对象作为查询参数传递
    // 假设你的 api 实例使用 axios，查询参数通过 config 对象的 params 字段传递
    const response = await api.get<SearchResponse>("/api/search/bydesc/", {
      params: {
        describe: params.describe,
      },
    });
    // --- 新增检查 ---
    // 检查后端返回的 code 是否表示成功
    if (response.data.code !== 200) {
      // 如果不是成功代码，手动抛出一个错误
      // 这个错误会被下面的 catch 块捕获
      const errorMessage =
        response.data.message ||
        `Backend returned non-200 code: ${response.data.code}`;
      console.error("Backend Logical Error:", response.data.code, errorMessage); // 可选：在抛出前先记录一下具体的业务错误
      throw new Error(errorMessage);
    }

    // 如果 code 是 200，返回成功的数据
    return response.data;
  } catch (error) {
    // 调用错误处理函数
    handleError(error);
    // 重新抛出错误，以便调用方也能捕获处理
    throw error;
  }
};

interface spiritSearchParams {
  spirit: string; // 歌曲描述
}

/**
 *  心情搜索
 * @param params
 */
export const spiritSearch = async (
  params: spiritSearchParams // 函数接收搜索参数
): Promise<SearchResponse> => {
  // 使用 Promise 包裹返回类型，表示异步操作
  try {
    // 发起 GET 请求，并将 params 对象作为查询参数传递
    // 假设你的 api 实例使用 axios，查询参数通过 config 对象的 params 字段传递
    const response = await api.get<SearchResponse>("/api/search/byspirit/", {
      params: {
        describe: params.spirit,
      },
    });
    // --- 新增检查 ---
    // 检查后端返回的 code 是否表示成功
    if (response.data.code !== 200) {
      // 如果不是成功代码，手动抛出一个错误
      // 这个错误会被下面的 catch 块捕获
      const errorMessage =
        response.data.message ||
        `Backend returned non-200 code: ${response.data.code}`;
      console.error("Backend Logical Error:", response.data.code, errorMessage); // 可选：在抛出前先记录一下具体的业务错误
      throw new Error(errorMessage);
    }

    // 如果 code 是 200，返回成功的数据
    return response.data;
  } catch (error) {
    // 调用错误处理函数
    handleError(error);
    // 重新抛出错误，以便调用方也能捕获处理
    throw error;
  }
};

interface titleSearchParams {
  title: string;
}

export const titleSearch = async (
  params: titleSearchParams // 函数接收搜索参数
): Promise<SearchResponse> => {
  // 使用 Promise 包裹返回类型，表示异步操作
  try {
    // 发起 GET 请求，并将 params 对象作为查询参数传递
    // 假设你的 api 实例使用 axios，查询参数通过 config 对象的 params 字段传递
    const response = await api.get<SearchResponse>("/api/search/related/", {
      params: {
        title: params.title,
      },
    });
    // --- 新增检查 ---
    // 检查后端返回的 code 是否表示成功
    if (response.data.code !== 200) {
      // 如果不是成功代码，手动抛出一个错误
      // 这个错误会被下面的 catch 块捕获
      const errorMessage =
        response.data.message ||
        `Backend returned non-200 code: ${response.data.code}`;
      console.error("Backend Logical Error:", response.data.code, errorMessage); // 可选：在抛出前先记录一下具体的业务错误
      throw new Error(errorMessage);
    }

    // 如果 code 是 200，返回成功的数据
    return response.data;
  } catch (error) {
    // 调用错误处理函数
    handleError(error);
    // 重新抛出错误，以便调用方也能捕获处理
    throw error;
  }
};

/**
 * 主搜索（AI搜索）
 * @param params
 */
export const unifiedSearch = async (
  params: UnifiedSearchParams
): Promise<UnifiedSearchResults> => {
  const query = params.query;

  // Map function names (implementation) to result keys (semantic meaning)
  const apiCalls = {
    byDescription: () => searchApi.describeSearch({ describe: query }),
    byMood: () => searchApi.spiritSearch({ spirit: query }),
    byTitle: () => searchApi.titleSearch({ title: query }),
    // Add other calls
    // byArtist: () => searchApi.artistSearch({ artist: query, page_wanted, page_size }),
  };

  const keys = Object.keys(apiCalls) as (keyof typeof apiCalls)[];
  // 直接执行函数获取 Promise，不在这里链式调用 .then().catch()
  const promises = keys.map((key) => apiCalls[key]());

  const results: UnifiedSearchResults = {}; // Initialize results object

  try {
    // 使用 Promise.allSettled 来等待所有 Promise 结束，无论成功还是失败
    // 它会返回一个数组，每个元素描述对应 Promise 的状态和值/原因
    const settledResults = await Promise.allSettled(promises);

    settledResults.forEach((result, index) => {
      const key = keys[index]; // 获取对应的分类 key (byDescription, byMood 等)

      if (result.status === "fulfilled") {
        // 如果 Promise 成功，将结果赋值给 UnifiedSearchResults 对应的属性
        // 需要进行类型断言，因为 result.value 是 unknown
        if (key === "byDescription")
          results.byDescription = result.value as SearchResponse;
        else if (key === "byMood")
          results.byMood = result.value as SearchResponse;
        else if (key === "byTitle")
          results.byTitle = result.value as SearchResponse;
        // ... 根据 key 赋值其他结果
      } else {
        // status === 'rejected'，这表明对应的 API 调用失败了。
        // 错误已经在底层的 API 函数（如 describeSearch）中通过 handleError 处理过了。
        // 在这里你不需要再次调用 handleError。
        // 你可以选择在这里记录一下哪个类型的搜索失败了，以便调试：
        console.error(`AI搜索: 关键词 ${key} 失败！原因：`, result.reason);
        // 对应的 results[key] 会保持 undefined 状态，表示该分类搜索失败/无结果。
      }
    });

    // 返回包含成功结果的对象
    return results;
  } catch (error) {
    // 这个外层的 catch 主要用于捕获在 Promise.allSettled 调用之前发生的错误
    // （比如参数准备错误等）。它不会捕获 Promise.allSettled 内部那些被拒绝的 Promise 的错误，
    // 因为 those are handled by allSettled returning status: 'rejected'.
    console.error("AI搜索意外错误：", error);
    // Decide if you want to re-throw or handle differently
    throw error;
  }
};

export const searchApi = {
  // 普通搜索
  searchByTitle,
  searchByArtist,
  searchByAlbum,
  normalSearch,
  // AI搜索
  describeSearch,
  spiritSearch,
  titleSearch,
  unifiedSearch,
};
