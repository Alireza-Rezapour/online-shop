export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId: string | null;
};

export interface MegaMenuItem {
  id: string;
  name: string;
  slug: string;
}

export interface MegaMenuSection {
  id: string;
  name: string;
  slug: string;

  items: MegaMenuItem[];
}

export interface MegaMenuCategory {
  id: string;
  name: string;
  slug: string;

  sections: MegaMenuSection[];
}
