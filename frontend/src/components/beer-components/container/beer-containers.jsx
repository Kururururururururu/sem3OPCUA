import BeerContainer from './beer-container.jsx'
import { useEffect, useState } from 'react'

const inventoryItems = ['wheat', 'barley', 'hops', 'yeast', 'malt']

export default function BeerContainers() {
	const [inventory, setInventory] = useState()

	useEffect(() => {
		const getInventory = async () => {
			const source = new EventSource('/api/inventory')

			source.onmessage = function (event) {
				console.log('event', event.data)
				const parsedData = JSON.parse(event.data)
				setInventory(parsedData)
			}
		}

		getInventory()
	}, [])

	const getPercent = (inventoryItem) => {
		if (!inventory) {
			return 0
		}

		const max = 35000
		// filter from the inventory object, where the key is the string in the inventoryItems array
		const current = inventory[inventoryItem]
		const percent = (current / max) * 100
		return percent
	}
	return (
		<div className='flex'>
			{inventoryItems.map((inventoryItem, index) => (
				<div
					key={index}
					className='flex flex-col'
				>
					<BeerContainer percent={getPercent(inventoryItem)} />
					<p className='text-2xl font-bold text-gray-900'>{inventoryItem}</p>
				</div>
			))}
		</div>
	)
}
