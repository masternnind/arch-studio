import { defineType, defineField } from "sanity";

export default defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "excerpt", type: "text", title: "Excerpt", rows: 3 }),
    defineField({
      name: "coverImage",
      type: "image",
      title: "Cover Image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({ name: "publishedAt", type: "datetime", title: "Published At", validation: (Rule) => Rule.required() }),
    defineField({ name: "tags", type: "array", title: "Tags", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
    defineField({
      name: "body",
      type: "array",
      title: "Body",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alt" }] },
      ],
    }),
  ],
  orderings: [{ title: "Published, New → Old", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", media: "coverImage" } },
});
