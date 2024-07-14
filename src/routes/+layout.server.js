import { crypto, fiat } from "$lib/server/context";
import { get } from "svelte/store";

export function load() {
	return { crypto: get(crypto), fiat: get(fiat) };
}
