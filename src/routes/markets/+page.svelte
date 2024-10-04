<svelte:options runes={true} />
<script>
import { crypto, fiat, formatPrice, getAsset } from "$lib/formatPrice";
import {
	Chart,
	HistogramSeries,
	LineSeries,
	PriceScale,
	TimeScale,
} from "svelte-lightweight-charts";

let { data } = $props();

let groupedTrades = Object.groupBy(data.trades, ({ currency }) => currency);
let markets = [...$fiat, ...$crypto]
	.map((e) => {
		return {
			...e,
			trades: groupedTrades[e.code],
			offers: data.offers[e.code],
		};
	})
	.filter((e) => e.offers || e.trades);

let interval = $state("86400000");
let [volume, swaps] = $derived(
	(() => {
		let volume = Object.groupBy(
			data.trades
				.map((e) => {
					return {
						volume: e.xmrAmount,
						time: e.date,
					};
				})
				.toSorted((a, b) => a.time - b.time),
			({ time }) => new Date(time - (time % interval)) / 1000,
		);
		let swaps = {};
		for (const intervalDate in volume) {
			swaps[intervalDate] = volume[intervalDate].reduce(
				(a) => {
					return {
						value: a.value + 1,
					};
				},
				{ value: 0 },
			);

			volume[intervalDate] = volume[intervalDate].reduce(
				(a, c) => {
					return {
						value: a.value + c.volume / 10 ** 12,
					};
				},
				{ value: 0 },
			);

			volume[intervalDate].time = Number.parseInt(intervalDate, 10);
			swaps[intervalDate].time = Number.parseInt(intervalDate, 10);
		}
		return [Object.values(volume), Object.values(swaps)];
	})(),
);

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
let w = $state();
</script>

<svelte:head>
	<title>Markets - Haveno Markets</title>
</svelte:head>

<div class="row">
	<div class="col card" style="flex:1;" bind:clientWidth={w}>
		<h4>
			<select bind:value={interval}>
				<option value="3600000">Hourly</option>
				<option value="86400000">Daily</option>
				<option value="604800000">Weekly</option>
			</select> Volume
		</h4>
		<Chart width={w-20} height={500} container={{class:"row"}} layout={chartLayout} grid={gridLayout}>
			<LineSeries data={volume} reactive={true} priceFormat={{precision:2, minMove:.01}}>
				<PriceScale scaleMargins={{bottom:.4, top:.1}}/>
			</LineSeries>
			<HistogramSeries data={swaps} reactive={true} priceScaleId="" priceFormat={{precision:0, minMove:1}}>
				<PriceScale scaleMargins={{top:.7, bottom:0}}/>
			</HistogramSeries>
			<TimeScale rightBarStaysOnScroll={true} rightOffset={0}/>
		</Chart>
	</div>
</div>
<div class="row">
<div class="card col">
	<h4>Markets</h4>
	<table>
		<tbody>
			<tr>
				<th>Currency</th>
				<th>Price</th>
				<th>Offers</th>
                <th>Volume (XMR)</th>
				<th>Trades</th>
			</tr>
			{#each Object.values(markets).toSorted((a,b) => (b.trades?.length||0) - (a.trades?.length||0) || (b.offers?.length||0) - (a.offers?.length||0) || (b.code < a.code ? 1 : -1)) as market}
			<tr>
                <td><a href="market/{market.code}">{getAsset(market.code).name} ({market.code})</a></td>
				<td>{formatPrice(market.trades?.[0]?.price, market.code, true, false) || "-"}</td>
				<td>{market.offers?.length || "-"}</td>
                <td>{formatPrice(market.trades?.reduce((a,b) => a + b.xmrAmount, 0), "XMR", false, false) || "-"}</td>
				<td>{market.trades?.length || "-"}</td>
			</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td></td>
				<td></td>
				<td>{Object.values(data.offers).flat().length}</td>
				<td>{formatPrice(data.trades.reduce((a,b) => a + b.xmrAmount, 0), "XMR", false, false)}</td>
				<td>{data.trades.length}</td>
			</tr>
		</tfoot>
	</table>
</div>
</div>
<div class="row">
<div class="card col">
	<h4>Latest Trades</h4>
<table>
	<tbody>
		<tr>
			<th>Date</th>
            <th>Price</th>
			<th>Amount (XMR)</th>
			<th>Amount</th>
		</tr>
		{#each data.trades.slice(0, 64) as trade}
		<tr>
			<td>{new Date(trade.date).toISOString().replace("T", " ").replace(/\.\d*Z/, "")}</td>
            <td>{formatPrice(trade.price, trade.currency, true, false)}</td>
			<td>{formatPrice(trade.xmrAmount, "XMR", false, false)}</td>
			<td>{formatPrice(trade.amount, trade.currency, false, false)} <span class="trade-currency">{trade.currency}</span></td>
		</tr>
		{/each}
	</tbody>
</table>
</div>
</div>