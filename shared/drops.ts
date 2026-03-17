export interface DropLink {
    label: string;
    url: string;
    icon?: string;
}

export interface DropMedia {
    images: string[];
    maps: string[];
}

export interface DropData {
    id: string;
    versePrimary: string;
    verseReference: {
        book: string;
        chapter: number;
        verse: number;
    };
    theme: string;
    exegesis: string;
    modernApplication: string[];
    media: DropMedia;
    links: DropLink[];
}

/**
 * Garment Drop data. Add new seasonal drops here.
 * Each entry becomes accessible at /drop/<id>
 */
export const drops: DropData[] = [
    {
        id: "summer-26-genesis",
        versePrimary: "In the beginning God created the heavens and the earth.",
        verseReference: { book: "genesis", chapter: 1, verse: 1 },
        theme: "Origins",
        exegesis:
            "This foundational verse establishes the sovereignty and creative power of God. It asserts that everything that exists owes its being to a deliberate, intelligent Creator, countering ancient near-eastern myths that suggested the world emerged from conflict or divine accidents.",
        modernApplication: [
            "Recognize that you are beautifully and intentionally made.",
            "See the world as a canvas of divine artistry, deserving of care and respect.",
            "Find ground and stability in knowing there is an ultimate Designer.",
        ],
        media: {
            images: [
                "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80",
            ],
            maps: [],
        },
        links: [
            {
                label: "The Salvation Army",
                url: "https://www.salvationarmy.org.au/",
            },
        ],
    },
];

export function getDropById(id: string): DropData | undefined {
    return drops.find((d) => d.id === id);
}
