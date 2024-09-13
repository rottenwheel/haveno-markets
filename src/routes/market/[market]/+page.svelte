<svelte:options runes={true} />
<script>
import { page } from "$app/stores";
import {
	formatPrice,
	getPrice,
	getSignificantDigits,
	isMoneroQuote,
} from "$lib/formatPrice";
import { CandlestickSeries, Chart, TimeScale } from "svelte-lightweight-charts";

const market = $page.params.market;
let { data } = $props();
const interval = 86400000;
let trades = $derived(
	(() => {
		let trades = data.trades
			.map((e) => {
				return {
					time: new Date(e.date),
					value: getPrice(e.price, e.currency, false, false),
				};
			})
			.toSorted((a, b) => a.time - b.time);

		trades = Object.groupBy(
			trades,
			({ time }) => new Date(time - (time % interval)) / 1000,
		);

		for (const intervalDate in trades) {
			trades[intervalDate] = trades[intervalDate].reduce((a, c) => {
				return {
					open: a.open ?? c.value,
					close: c.value,
					high: (c.value > a.high ? c.value : a.high) ?? c.value,
					low: (c.value < a.low ? c.value : a.low) ?? c.value,
				};
			}, {});
			trades[intervalDate].time = Number.parseInt(intervalDate, 10);
		}
		return Object.values(trades);
	})(),
);

let precision = $derived(
	getSignificantDigits(trades.flatMap((e) => [e.open, e.close])),
);
let w = $state();

const chartLayout = {
	background: {
		color: "#090020",
	},
	textColor: "#f6efff",
};
const gridLayout = {
	vertLines: {
		visible: false,
	},
	horzLines: {
		color: "#FFF5",
	},
};

const marketPair = isMoneroQuote(market) ? `${market}/XMR` : `XMR/${market}`;
const BUY_SELL = isMoneroQuote(market) ? ["SELL", "BUY"] : ["BUY", "SELL"];
</script>
<svelte:head>
	<title>{marketPair} - Haveno Markets</title>
</svelte:head>
<div class="row">
	<div class="col card" bind:clientWidth={w}>
		<h4>{marketPair}</h4>
		<span class="price">{formatPrice(data.trades?.[0]?.price, market, true, false)}</span>
		<Chart width={w-20} height={500} container={{class:"row"}} layout={chartLayout} grid={gridLayout}>
			<CandlestickSeries data={trades} reactive={true} priceFormat={{minMove:10**-precision, precision:precision}}></CandlestickSeries>
			<TimeScale rightBarStaysOnScroll={true} rightOffset={0}/>
		</Chart>
	</div>
</div>
<div class="row">
<div class="col card">
<h4>Buy Offers</h4>
<table>
	<tbody>
		<tr>
			<th>Price</th>
			<th>Amount (XMR)</th>
			<th>Amount ({market})</th>
		</tr>
		{#each data.offers[BUY_SELL[0]]?.toSorted((a,b) => b.price - a.price)||[] as offer}
		<tr title={offer.paymentMethod}>
			<td>{formatPrice(offer.price, market, false, false)}</td>
			<td>{formatPrice(offer.amount, "XMR", false, false)}</td>
			<td>{formatPrice(offer.primaryMarketAmount, market, false, false)}</td>
		</tr>
		{/each}
	</tbody>
</table>
</div>
<div class="col card">
<h4>Sell Offers</h4>
<table>
	<tbody>
		<tr>
			<th>Price</th>
			<th>Amount (XMR)</th>
			<th>Amount ({market})</th>
		</tr>
		{#each data.offers[BUY_SELL[1]]?.toSorted((a,b) => a.price - b.price)||[] as offer}
		<tr title={offer.paymentMethod}>
			<td>{formatPrice(offer.price, market, false, false)}</td>
			<td>{formatPrice(offer.amount, "XMR", false, false)}</td>
			<td>{formatPrice(offer.primaryMarketAmount, market, false, false)}</td>
		</tr>
		{/each}
	</tbody>
</table>
</div>
</div>
<div class="row">
	<div class="col card">
		<h4>Latest Trades</h4>
		<table>
			<tbody>
				<tr>
					<th>Date</th>
					<th>Price</th>
					<th>Amount (XMR)</th>
					<th>Amount ({market})</th>
				</tr>
				{#each data.trades as trade}
					<tr>
						<td>{new Date(trade.date).toISOString().replace("T", " ").replace(/\.\d*Z/, "")}</td>
						<td>{formatPrice(trade.price, trade.currency, false, false)}</td>
						<td>{formatPrice(trade.xmrAmount, "XMR", false, false)}</td>
						<td>{formatPrice(trade.amount, trade.currency, false, false)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>