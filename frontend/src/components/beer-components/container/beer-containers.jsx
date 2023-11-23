import BeerContainer from './beer-container.jsx'
import { beers } from '../../../constants/beers.js'

export default function BeerContainers() {
	return (
		<div className='flex'>
			{beers.map((type, index) => (
				<div key={index} className='flex flex-col'>
					<BeerContainer />
					<p className='text-2xl font-bold text-gray-900'>{type}</p>
				</div>
			))}
		</div>
	)
}
