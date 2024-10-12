import { offers, trades } from "$lib/server/context";
import { get } from "svelte/store";

export async function load({ params }) {
	let groupedOffers = { BUY: [], SELL: [] };
	if (get(offers)[params.market]?.length > 0) {
		groupedOffers = Object.groupBy(
			get(offers)[params.market],
			({ direction }) => direction,
		);
		groupedOffers.BUY = groupedOffers.BUY
			? Object.groupBy(groupedOffers.BUY, ({ price }) => price)
			: [];
		groupedOffers.SELL = groupedOffers.SELL
			? Object.groupBy(groupedOffers.SELL, ({ price }) => price)
			: [];
	}
	return {
		trades: get(trades).filter(({ currency }) => currency === params.market),
		offers: groupedOffers,
	};
}
