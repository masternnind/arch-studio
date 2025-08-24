import { defineType, defineField } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
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
    defineField({ name: "summary", type: "text", title: "Summary" }),
    defineField({
      name: "thumbnail",
      type: "image",
      title: "Thumbnail",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "heroImages",
      type: "array",
      title: "Hero Images",
      of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alt" }] }],
    }),
    defineField({ name: "tags", type: "array", title: "Tags", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
    defineField({ name: "date", type: "date", title: "Project Date" }),
    defineField({ name: "url", type: "url", title: "External URL" }),
    defineField({
      name: "content",
      type: "array",
      title: "Content",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string" }] }],
    }),
  ],
  preview: { select: { title: "title", media: "thumbnail" } },
});
