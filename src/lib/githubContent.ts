const OWNER = "muravaish";
const REPO = "Personal-portfolio";
const FILE_PATH = "src/data/profile.ts";

export interface PublishResult {
  success: boolean;
  commitUrl?: string;
  error?: string;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function encodeUtf8Base64(content: string) {
  return btoa(unescape(encodeURIComponent(content)));
}

async function getFileSha(token: string, branch: string): Promise<string | undefined> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${encodeURIComponent(branch)}`,
    { headers: authHeaders(token) },
  );
  if (res.status === 404) return undefined;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Could not read the current file (${res.status}).`);
  }
  const data = await res.json();
  return data.sha as string;
}

/** Commits new content for src/data/profile.ts directly to the given branch using a user-supplied GitHub token. */
export async function publishProfileFile(
  token: string,
  branch: string,
  content: string,
  message: string,
): Promise<PublishResult> {
  if (!token.trim()) return { success: false, error: "Add a GitHub token in Settings first." };
  try {
    const sha = await getFileSha(token, branch);
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: encodeUtf8Base64(content),
        branch,
        sha,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        success: false,
        error: body?.message || `GitHub responded with ${res.status}.`,
      };
    }
    const data = await res.json();
    return { success: true, commitUrl: data?.commit?.html_url };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not reach GitHub.",
    };
  }
}
