<script>
Object.groupBy ||= (values, keyFinder) => {
	return values.reduce((a, b) => {
		const key = typeof keyFinder === "function" ? keyFinder(b) : b[keyFinder];

		if (!a[key]) {
			a[key] = [b];
		} else {
			a[key] = [...a[key], b];
		}

		return a;
	}, {});
};
</script>

<div class="col app">
	<div class="row header" style="align-content:center;">
		<span>
			<img src="/haveno_logo.png" alt="" style="height:1em;"/>
			<a href="https://haveno.exchange">haveno.exchange</a>
		</span>
		<a href="/">haveno.markets</a>
		<span>
			<img src="/monero_logo.png" alt="" style="height:1em;"/>
			<a href="https://xmrchain.net">xmrchain.net</a>
		</span>
	</div>
	<div class="col container">
		<slot></slot>
	</div>
	<div class="col footer">
		<span>
			Links:
			<a href="https://haveno.markets">Clearnet</a> |
			<a href="http://lsj5o4i7iiogz6q4rstiv75nk7kots2f2nhuga75y7s23leskz2uh6id.onion">Tor</a> |
			<a href="http://haveno-markets.i2p">I2P</a>
			<a href="http://okoeicsihmjkqcqaiqow3arcrzm5ascwhpxq34incxg6a5z4tjza.b32.i2p">(b32)</a>
		</span>
		<span style="display:flex;gap:.2em;">
			Data from:
			<a href="https://haveno-reto.com" style="display:inline-flex;gap:.2em;align-items:center;">
				<img src="/haveno-reto_logo.svg" alt="" style="height:1em;width:1em;"/>
				haveno-reto
			</a>
		</span>
		<span>
			Donations: 
			<a style="word-break:break-all;" href="monero:84LnuW3YpCQirNMN6y6Px1E3DfwnqwXVRARi9eHjzeSVFJqEQmJCxkP5WpkysbcktqUNhXxQLowhJGSknNjJWZNQ7FKp5bu">
				84LnuW3YpCQirNMN6y6Px1E3DfwnqwXVRARi9eHjzeSVFJqEQmJCxkP5WpkysbcktqUNhXxQLowhJGSknNjJWZNQ7FKp5bu
			</a>
		</span>
	</div>
</div>
<style lang="scss" global>
	.app {
		display:flex;
		width:100%;
		justify-content:center;
		min-height: 100dvh;
	}
	.container {
		width:80%!important;
	}
	.header {
		background-color:#5555;
		padding:1em 0;
	}
	.footer {
		background-color:#4444;
		margin-top:auto;
		text-align:center;
	}
	.col{
		display:flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width:100%;
		height:100%;
	}
	.row {
		display:flex;
		flex-direction: row;
		width:100%;
		height:100%;
		justify-content: space-around;
	}
	body {
		background-color:#290040;
		color:white;
		margin:0;
		padding:0;
	}
	.card {
		margin:1em;
		padding:.5em;
		background-color:#552A64;
		border-radius: 5px;
		:global(h4) {
			text-align: center;
			color:#F1482D;
		}
		table {
			width: 100%;
			border-collapse:collapse;
			th, td {
				text-align:right;
				padding:.3em;
			}
			th:first-child, td:first-child{
				text-align:left;
			}
			tr:nth-child(2n){
				background-color: #0002;
			}
		}
	}
	
	a, .price {
		text-decoration: none;
		color:#f60;
	}
	a:hover{
		text-decoration: underline;
	}
	.price {
		font-size:2em;
		margin-bottom:.4em;
	}
	h4 {
		margin:.4em;
	}
	.trade-currency {
		font-size:1em;
		color:#fff6;
		font-weight:bold;
		font-family: monospace;
	}
	@media only screen and (max-width: 600px) {
		.row {
			flex-direction: column;
		}
		.container {
			width: 97%!important;
		}
		.card {
			margin:.5em 0;
			padding:.5em 0;
		}
		.header {
			padding:.2em 0;
		}
	}
	.header > * {
		display:flex;
		width:33.3%;
		align-items: center;
		justify-content: center;
		gap:.2em;
	}
	@media only screen and (max-width: 600px){
		.header > * {
			width:initial;
		}
	}
</style>