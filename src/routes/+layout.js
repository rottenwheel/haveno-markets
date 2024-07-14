import { crypto, fiat } from "$lib/formatPrice";

export function load({ data }) {
	crypto.set(data.crypto);
	fiat.set(data.fiat);
}
