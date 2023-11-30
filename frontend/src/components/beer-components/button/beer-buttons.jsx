import BeerButton from './beer-button.jsx'
import { beers } from '../../../constants/beers.js'

export default function BeerButtons({setIsActive}) {
	function brewBeer(beer) {
		fetch('/api/pass-to-queue', {
			method: 'POST',
			body: JSON.stringify({
				type: beer,
				amount: 1,
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
		setIsActive(true)
	}

	return (
		<div className={'flex gap-4'}>
			{beers.map((beer, index) => (
                <BeerButton key={index} beer={beer.type} brewBeer={() => brewBeer(beer.type)}/>
            ))}
		</div>
	)
}
