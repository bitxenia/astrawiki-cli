import axios, { HttpStatusCode } from "axios";

const SERVER_ADDRESS = "http://localhost:31337";

type GetArticleResponse = {
  name: string;
  content: string;
};

type GetArticleListResponse = {
  articles: string[];
};

export async function getArticle(name: string): Promise<GetArticleResponse> {
  const { data } = await axios.get<GetArticleResponse>(
    SERVER_ADDRESS + `/articles/${name}`,
  );
  return data;
}

export async function addArticle(name: string, content: string): Promise<void> {
  let { status } = await axios.post(SERVER_ADDRESS + "/articles", {
    name,
    content,
  });
  if (status === HttpStatusCode.InternalServerError) {
    throw new Error("Failed to add article");
  }
}

export async function editArticle(
  name: string,
  content: string,
): Promise<void> {
  let { status } = await axios.patch(SERVER_ADDRESS + `/articles/${name}`, {
    content,
  });
  if (status === HttpStatusCode.InternalServerError) {
    throw new Error("Failed to edit article");
  }
}

export async function getArticleList(): Promise<string[]> {
  const { data, status } = await axios.get<GetArticleListResponse>(
    SERVER_ADDRESS + "/articles",
  );
  if (status === HttpStatusCode.InternalServerError) {
    throw new Error("Failed to get article list");
  }
  return data.articles;
}

export async function isServerRunning(): Promise<boolean> {
  try {
    const { status } = await axios.get(SERVER_ADDRESS);
    return status === HttpStatusCode.Ok;
  } catch {
    return false;
  }
}
