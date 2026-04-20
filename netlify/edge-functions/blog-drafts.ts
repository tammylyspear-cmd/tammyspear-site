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
    // In production: remove draft post items from listing entirely
    html = html.replace(
      /<article[^>]*data-draft="true"[^>]*>[\s\S]*?<\/article>/g,
      ""
    );

    // If this is a draft post page (single post with data-draft="true"), return 404
    if (
      html.includes('data-draft="true"') &&
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
