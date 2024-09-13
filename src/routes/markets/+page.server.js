import { trades } from "$lib/server/context";
import { get } from "svelte/store";

export function load() {
	return { trades: get(trades) };
}
