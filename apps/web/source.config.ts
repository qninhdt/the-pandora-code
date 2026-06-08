import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { z } from "zod";

export const docs = defineDocs({
  dir: "../../content/chapters",
  meta: { schema: z.any() },
  docs: { schema: z.any() },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
});
