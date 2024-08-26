import { EmbedBuilder } from "discord.js";
import { Colors } from "#lib/colors";

export class IxveriaEmbedBuilder extends EmbedBuilder {
    public constructor() {
        super();
        this.setColor(Colors.primary);
    }

    /**
     * Set the color of the embed.
     * @see {@link COLORS} for available colors.
     */
    public setTheme(color: keyof typeof Colors): this {
        this.setColor(Colors[color]);
        return this;
    }
}
