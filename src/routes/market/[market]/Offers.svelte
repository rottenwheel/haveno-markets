<svelte:options runes={true} />

<script>
import { formatPrice } from "$lib/formatPrice";

let { offers = [], market, title, showOrders } = $props();
offers = Object.values(offers);
</script>

<div class="col card" style="--text-align: {showOrders ? 'left' : 'right'}">
	<h4>{title}</h4>
	<table>
		<thead>
			<tr>
				<th>Price</th>
				{#if showOrders}<th>Payment Method</th>{/if}
				<th>Amount (XMR)</th>
				<th>Amount ({market})</th>
			</tr>
		</thead>
		<tbody>
			{#if !showOrders}
				{#each offers as offer}
					<tr>
						<td>{formatPrice(offer[0].price, market, false, false)}</td>
						<td
							>{formatPrice(
								offer.reduce((a, b) => a + b.amount, 0),
								"XMR",
								false,
								false,
							)}</td
						>
						<td
							>{formatPrice(
								offer.reduce((a, b) => a + b.primaryMarketAmount, 0),
								market,
								false,
								false,
							)}</td
						>
					</tr>
				{/each}
			{:else}
				{#each offers.flat() as offer}
					<tr>
						<td>{formatPrice(offer.price, market, false, false)}</td>
						{#if showOrders}<td>{offer.paymentMethod}</td>{/if}
						<td>{formatPrice(offer.amount, "XMR", false, false)}</td>
						<td
							>{formatPrice(
								offer.primaryMarketAmount,
								market,
								false,
								false,
							)}</td
						>
					</tr>
				{/each}
			{/if}
		</tbody>
		<tfoot>
			<tr>
				<td>{offers.flat().reduce((a, b) => a + 1, 0)} Offers</td>

				{#if showOrders}<td></td>{/if}
				<td
					>{formatPrice(
						offers.flat().reduce((a, b) => a + b.amount, 0),
						"XMR",
						false,
						false,
					) || ""}</td
				>
				<td
					>{formatPrice(
						offers.flat().reduce((a, b) => a + b.primaryMarketAmount, 0),
						market,
						false,
						false,
					) || ""}</td
				>
			</tr>
		</tfoot>
	</table>
</div>

<style>
	td,
	th {
		&:nth-child(2) {
			text-align: var(--text-align);
		}
	}
</style>
