import type { Context, Config } from "@netlify/edge-functions";

export default async (req: Request, context: Context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const deployContext = context.deploy?.context || "production";
  const isPreview = deployContext !== "production";
  let html = await response.text();

  if (isPreview) {
    // In deploy previews: show draft posts by unhiding them
    html = html.replace(
      /data-draft="true" style="display:none;"/g,
      'data-draft="true"'
    );
  } else {
    // In production: remove draft post items from listing entirely.
    // Anchored to <article ...> so HTML comments or scaffolding text
    // containing the literal string data-draft="true" cannot trip this.
    const draftArticleRe =
      /<article\b[^>]*\bdata-draft=(["'])true\1[^>]*>[\s\S]*?<\/article>/gi;
    html = html.replace(draftArticleRe, "");

    // If this is a single post page where the article itself is a draft,
    // return 404. We strip HTML comments before checking so that a
    // template-instructions comment containing data-draft="true" cannot
    // false-positive as a real draft article.
    const htmlNoComments = html.replace(/<!--[\s\S]*?-->/g, "");
    const singleDraftArticleRe =
      /<article\b[^>]*\bdata-draft=(["'])true\1/i;
    if (
      singleDraftArticleRe.test(htmlNoComments) &&
      !req.url.includes("/blog/index")
    ) {
      const url = new URL(req.url);
      if (url.pathname !== "/blog/" && url.pathname !== "/blog") {
        return new Response("Not Found", { status: 404 });
      }
    }
  }

  // Clone headers and strip stale Content-Length so Netlify recomputes it
  // against the rewritten HTML body. A stale Content-Length causes
  // Googlebot/Bingbot to record "couldn't fetch" / truncated responses.
  const outHeaders = new Headers(response.headers);
  outHeaders.delete("content-length");
  outHeaders.delete("Content-Length");

  return new Response(html, {
    status: response.status,
    headers: outHeaders,
  });
};

export const config: Config = {
  path: "/blog/*",
};
