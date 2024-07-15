import { watch } from "fs";
import { writable } from "svelte/store";

const offers = writable([]);
const trades = writable([]);
const crypto = writable([]);
const fiat = writable([]);

const formatTrades = (e) => {
	return e.map((e) => {
		const crypto = e.primaryMarketTradeVolume === e.tradeAmount;

		return {
			currency: e.currency,
			price: e.tradePrice,
			xmrAmount: e.tradeAmount,
			amount: crypto ? e.primaryMarketTradeAmount : e.primaryMarketTradeVolume,
			date: e.tradeDate,
		};
	});
};
const formatOffers = (e) => {
	return Object.groupBy(e, ({ currencyCode }) => currencyCode);
};
const formatCrypto = (e) => {
	e[e.findIndex((e) => e.code === "XMR")].precision = 12;
	e[e.findIndex((e) => e.code === "XMR")].sign = "ɱ";
	return e;
};
const formatFiat = (e) => {
	e[e.findIndex((e) => e.code === "USD")].sign = "$";
	e[e.findIndex((e) => e.code === "EUR")].sign = "€";
	e[e.findIndex((e) => e.code === "GBP")].sign = "£";
	e[e.findIndex((e) => e.code === "AUD")].sign = "$";
	e[e.findIndex((e) => e.code === "CAD")].sign = "$";
	e[e.findIndex((e) => e.code === "SEK")].sign = "kr";
	return e;
};

Bun.file(`${import.meta.env.VITE_DB_PATH}offers_statistics.json`)
	.json()
	.then((j) => {
		offers.set(formatOffers(j));
	});
Bun.file(`${import.meta.env.VITE_DB_PATH}trade_statistics.json`)
	.json()
	.then((j) => {
		trades.set(formatTrades(j));
	});
Bun.file(`${import.meta.env.VITE_DB_PATH}crypto_currency_list.json`)
	.json()
	.then((j) => {
		crypto.set(formatCrypto(j));
	});
Bun.file(`${import.meta.env.VITE_DB_PATH}/traditional_currency_list.json`)
	.json()
	.then((j) => {
		fiat.set(formatFiat(j));
	});

const watcher = watch(import.meta.env.VITE_DB_PATH, async (_, filename) => {
	const file = Bun.file(import.meta.env.VITE_DB_PATH + filename);
	switch (filename) {
		case "offers_statistics.json":
			offers.set(formatOffers(await file.json()));
			break;
		case "trade_statistics.json":
			trades.set(formatTrades(await file.json()));
			break;
		case "crypto_currency_list.json":
			crypto.set(formatCrypto(await file.json()));
			break;
		case "traditional_currency_list.json":
			fiat.set(formatFiat(await file.json()));
			break;
	}
});

process.on("SIGINT", () => {
	// close watcher when Ctrl-C is pressed
	console.log("Closing watcher...");
	watcher.close();

	process.exit(0);
});

export { offers, trades, crypto, fiat };
