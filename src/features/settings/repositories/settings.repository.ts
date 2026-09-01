import { prisma } from "@/lib/prisma";

export type ContactInfoSetting = {
  email: string;
  phone: string;
  address: string;
};

export type SocialLinksSetting = {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
};

export type SeoDefaultsSetting = {
  siteTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  ogImage?: string;
};

const DEFAULT_CONTACT_INFO: ContactInfoSetting = {
  email: "sales@yourdomain.com",
  phone: "+92 300 0000000",
  address: "Industrial Estate, Sialkot, Punjab, Pakistan",
};

const DEFAULT_SOCIAL_LINKS: SocialLinksSetting = {};

const DEFAULT_SEO: SeoDefaultsSetting = {
  siteTitle: "Virtous Uniform | Premium Professional Workwear Manufacturer",
  titleTemplate: "%s | Virtous Uniform Co.",
  defaultDescription:
    "ISO-certified manufacturer of professional uniforms, workwear, and protective gear, exporting to 40+ countries with rigorous quality assurance and scalable production capacity.",
  ogImage: "",
};

export const settingsRepository = {
  async getContactInfo(): Promise<ContactInfoSetting> {
    const row = await prisma.siteSetting.findUnique({ where: { key: "contact_info" } });
    return row ? { ...DEFAULT_CONTACT_INFO, ...(row.value as object) } : DEFAULT_CONTACT_INFO;
  },

  async setContactInfo(value: ContactInfoSetting) {
    return prisma.siteSetting.upsert({
      where: { key: "contact_info" },
      update: { value },
      create: { key: "contact_info", value },
    });
  },

  async getSocialLinks(): Promise<SocialLinksSetting> {
    const row = await prisma.siteSetting.findUnique({ where: { key: "social_links" } });
    return row ? { ...DEFAULT_SOCIAL_LINKS, ...(row.value as object) } : DEFAULT_SOCIAL_LINKS;
  },

  async setSocialLinks(value: SocialLinksSetting) {
    return prisma.siteSetting.upsert({
      where: { key: "social_links" },
      update: { value },
      create: { key: "social_links", value },
    });
  },

  async getSeoDefaults(): Promise<SeoDefaultsSetting> {
    const row = await prisma.siteSetting.findUnique({ where: { key: "seo_defaults" } });
    return row ? { ...DEFAULT_SEO, ...(row.value as object) } : DEFAULT_SEO;
  },

  async setSeoDefaults(value: SeoDefaultsSetting) {
    return prisma.siteSetting.upsert({
      where: { key: "seo_defaults" },
      update: { value },
      create: { key: "seo_defaults", value },
    });
  },
};
