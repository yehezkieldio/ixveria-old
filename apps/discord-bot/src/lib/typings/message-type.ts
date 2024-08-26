import type { InteractionResponse, Message } from "discord.js";
import type { IxveriaCommand } from "#lib/extensions/command";

export type ChatMessageResponse = Message | InteractionResponse;
export type ChatMessageContext = Message | IxveriaCommand.ChatInputCommandInteraction;
