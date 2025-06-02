import { statusTagEnum, typeTagEnum } from 'drizzle/schema';

export interface Project {
  id: number;
  title: string;
  briefDesc: string;
  fullDesc: string;
  dateLaunched: Date;
  links: { name: string; link: string }[] | null;
  images: string[];
  status: (typeof statusTagEnum.enumValues)[number];
  type: (typeof typeTagEnum.enumValues)[number];
  featured: boolean;
  modified_at: Date;
  created_at: Date;
}
