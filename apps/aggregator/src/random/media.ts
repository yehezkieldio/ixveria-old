import { FetchResultTypes, fetch } from "@sapphire/fetch";
import Elysia from "elysia";

const mediaModule = new Elysia({ name: "Module.Random.Media" });

type CatAsService = {
    _id: string;
};

mediaModule.group("/media", (app) =>
    app.get(
        "/cat",
        async ({ set }) => {
            const url = "https://cataas.com/cat?json=true";

            const response: CatAsService = await fetch<CatAsService>(url, FetchResultTypes.JSON);
            const imageUrl = `https://cataas.com/cat/${response._id}`;
            const image: Buffer = await fetch(imageUrl, FetchResultTypes.Buffer);

            set.headers["content-type"] = "image/jpeg";
            return image;
        },
        {
            detail: {
                summary: "Get a random cat image.",
                description: "Fetches a random cat image from Cataas.",
                tags: ["Random Media"],
            },
        },
    ),
);

export default mediaModule;
