<svelte:options runes={true} />
<script>
import {
	formatPrice,
	getAsset,
	getPrice,
	getSignificantDigits,
} from "$lib/formatPrice";
import {
	CandlestickSeries,
	Chart,
	HistogramSeries,
	LineSeries,
	PriceScale,
	TimeScale,
} from "svelte-lightweight-charts";

let {data} = $props();
const grouped = Object.groupBy(data.trades, ({ currency }) => currency);
let interval = $state("86400000");
let key = $state("USD");
let trades = $derived((() => {
	let trades = grouped[key]
		.map((e) => {
			return {
				time: new Date(e.date),
				value: getPrice(e.price, e.currency),
			};
		})
		.toSorted((a, b) => (a.time - b.time));

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
})());
let [volume, swaps] = $derived((() => {
	let volume = Object.groupBy(
		data.trades
			.map((e) => {
				return {
					volume: e.xmrAmount,
					time: e.date,
				};
			})
			.toSorted((a, b) => (a.time - b.time)),
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
})());
let precision = $derived(getSignificantDigits(trades.flatMap((e) => [e.open, e.close])));

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
	<title>Haveno Markets</title>
</svelte:head>

<div class="row">
	<div class="col card">
		<h4>XMR/USD</h4>
		<span class="price">{formatPrice(grouped["USD"][0].price, "USD", true)}</span>
	</div>
	<div class="col card">
		<h4>Liquidity</h4>
		<span class="price">{formatPrice(data.liquidity, "XMR", true, false)}</span>
	</div>
</div>

<div class="row">
	<div class="col card" style="flex:1;" bind:clientWidth={w}>
		<h4>Price XMR/<select bind:value={key}>
			{#each Object.keys(grouped) as key}
				<option>{key}</option>
			{/each}
		</select></h4>

		<Chart width={w-20} height={300} container={{class:"row"}} layout={chartLayout} grid={gridLayout}>
			<CandlestickSeries data={trades} reactive={true} priceFormat={{minMove:10**-precision, precision:precision}}></CandlestickSeries>
			<TimeScale rightBarStaysOnScroll={true} rightOffset={0}/>
		</Chart>
	</div>
	<div class="col card" style="flex:1">
		<h4>
			<select bind:value={interval}>
				<option value="3600000">Hourly</option>
				<option value="86400000">Daily</option>
				<option value="604800000">Weekly</option>
			</select> Volume</h4>
		<Chart width={w-20} height={300} container={{class:"row"}} layout={chartLayout} grid={gridLayout}>
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
				<th>Trades</th>
			</tr>
			{#each Object.values(Object.groupBy(data.trades, ({currency}) => currency)).toSorted((a,b) => b.length - a.length || (b[0].currency < a[0].currency ? 1 : -1)).slice(0, 16) as market}
			<tr>
				<td><a href="market/{market[0].currency}">{getAsset(market[0].currency).name} ({market[0].currency})</a></td>
				<td>{formatPrice(market[0].price, market[0].currency, true, false)}</td>
				<td>{market.length}</td>
			</tr>
			{/each}
		</tbody>
	</table>
	<h4><a href="markets">View more »</a></h4>
</div>
<div class="card col">
	<h4>Trades</h4>
<table>
	<tbody>
		<tr>
			<th>Date</th>
			<th>Amount (XMR)</th>
			<th>Amount</th>
		</tr>
		{#each data.trades.slice(0, 16) as trade}
		<tr>
			<td>{new Date(trade.date).toISOString().replace("T", " ").replace(/\.\d*Z/, "")}</td>
			<td>{formatPrice(trade.xmrAmount, "XMR", false, false)}</td>
			<td>{formatPrice(trade.amount, trade.currency, false, false)} <span class="trade-currency">{trade.currency}</span></td>
		</tr>
		{/each}
	</tbody>
</table>
<h4><a href="trades">View more »</a></h4>
</div>
</div>