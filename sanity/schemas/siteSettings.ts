import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "string", title: "Site Title", validation: (Rule) => Rule.required() }),
    defineField({ name: "siteDescription", type: "text", title: "Site Description" }),
    defineField({
      name: "logo",
      type: "image",
      title: "Logo",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt" }],
    }),
    defineField({
      name: "socialLinks",
      type: "array",
      title: "Social Links",
      of: [defineType({ name: "socialLink", title: "Social Link", type: "object", fields: [
        { name: "label", type: "string", title: "Label" },
        { name: "url", type: "url", title: "URL" },
      ]})],
    }),
  ],
  preview: { select: { title: "siteTitle", media: "logo" } },
});
