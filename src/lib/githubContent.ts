const OWNER = "muravaish";
const REPO = "Personal-portfolio";
const PROFILE_PATH = "src/data/profile.ts";

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

async function getFileSha(token: string, path: string, branch: string): Promise<string | undefined> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${encodeURIComponent(branch)}`,
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

/** Commits base64-encoded content to any path in the repo using a user-supplied GitHub token. */
async function commitFile(
  token: string,
  branch: string,
  path: string,
  base64Content: string,
  message: string,
): Promise<PublishResult> {
  if (!token.trim()) return { success: false, error: "Add a GitHub token in Settings first." };
  try {
    const sha = await getFileSha(token, path, branch);
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: base64Content,
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

/** Commits new content for src/data/profile.ts directly to the given branch using a user-supplied GitHub token. */
export async function publishProfileFile(
  token: string,
  branch: string,
  content: string,
  message: string,
): Promise<PublishResult> {
  return commitFile(token, branch, PROFILE_PATH, encodeUtf8Base64(content), message);
}

/** Commits an already-base64-encoded binary file (e.g. an uploaded image) to public/<subdir>/<filename>. */
export async function publishPublicAsset(
  token: string,
  branch: string,
  subdir: string,
  filename: string,
  base64Content: string,
  message: string,
): Promise<PublishResult & { publicPath?: string }> {
  const path = `public/${subdir}/${filename}`;
  const result = await commitFile(token, branch, path, base64Content, message);
  if (!result.success) return result;
  return { ...result, publicPath: `/${subdir}/${filename}` };
}
