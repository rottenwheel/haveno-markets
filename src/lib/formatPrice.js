import { get, writable } from "svelte/store";

const crypto = writable([]);
const fiat = writable([]);

const isMoneroQuote = (currency) => {
	return !!get(crypto).find((e) => e.code === currency);
};

const getAsset = (currency) => {
	return (
		get(crypto).find((e) => e.code === currency) ||
		get(fiat).find((e) => e.code === currency)
	);
};

const getSignificantDigits = (price) => {
	const avg =
		price.length > 0 ? price.reduce((a, b) => a + b) / price.length : price;
	let i = -4;
	for (; i < 20; i++) {
		if (Math.floor(avg * 10 ** i) >= 1000) break;
	}
	if (i <= 1) i = 2;
	return i;
};

const getPrice = (price, currency = "XMR", useQuote = true) => {
	return isMoneroQuote(currency) && useQuote
		? 10 ** getAsset(currency).precision / price
		: price / 10 ** getAsset(currency).precision;
};

const formatPrice = (
	price,
	currency = "XMR",
	showSign = false,
	useQuote = true,
) => {
	const calculatedPrice = getPrice(price, currency, useQuote);
	return (
		(showSign
			? getAsset(isMoneroQuote(currency) ? "XMR" : currency).sign || ""
			: "") +
		calculatedPrice.toLocaleString(undefined, {
			minimumFractionDigits: getSignificantDigits(calculatedPrice),
			maximumFractionDigits: getSignificantDigits(calculatedPrice),
		})
	);
};

export {
	formatPrice,
	getPrice,
	getSignificantDigits,
	getAsset,
	isMoneroQuote,
	crypto,
	fiat,
};
