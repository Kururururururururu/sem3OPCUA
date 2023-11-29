import { useEffect, useState } from 'react'
import BeerButtons from './components/beer-components/button/beer-buttons.jsx'
import BeerContainers from './components/beer-components/container/beer-containers.jsx'
import StartStopButtons from './components/start-stop-buttons.jsx'

export default function Temp() {
	const [isActive, setIsActive] = useState(false)

	return (
		<div className={'container mx-auto mt-10 flex flex-col gap-4'}>
			<BeerButtons />

			<div className='w-full h-1 bg-gray-500 my-4' />

			<div className='w-full flex items-center justify-center'>
				<BatchIdProgressBar
					isActive={isActive}
					setIsActive={setIsActive}
				/>
			</div>
			<div className='w-full h-1 bg-gray-500 my-4' />
			<div className={'flex justify-between'}>
				<StartStopButtons setIsActive={setIsActive} />
				<BeerContainers />
			</div>
		</div>
	)
}

function BatchIdProgressBar({ isActive, setIsActive }) {
	const [progress, setProgress] = useState(0)
	const [batchId, setBatchId] = useState(0)

	useEffect(() => {
		// make an sse request to the server to get the current batch id
		// set the progress to the current batch id
		// set the is active to true
		// when the progress is 100, set the is active to false
		// when the is active is false, clear the interval
		const getBatchId = async () => {
			const source = new EventSource('/api/batch')

			source.onmessage = function (event) {
				console.log('event', event)
				if (event.data === 'done') {
					setIsActive(false)
					return
				}

				const parsedData = JSON.parse(event.data)
				const batchIdFromServer = parsedData.batch

				console.log('batchId', batchIdFromServer)

				// parse the event data and be sure that it matches a number
				if (isNaN(batchIdFromServer)) {
					return
				}
				if (batchIdFromServer === batchId) {
					return
				} else {
					setBatchId(batchIdFromServer)
					if (batchIdFromServer === 0) {
						setIsActive(false)
					} else {
						setIsActive(true)
					}
				}
			}
		}
		getBatchId()
	}, [batchId, setIsActive, isActive])

	useEffect(() => {
		if (isActive) {
			const interval = setInterval(() => {
				setProgress((progress) => {
					if (progress >= 100) {
						clearInterval(interval)
						setIsActive(false)
						return 0
					}
					return progress + 1
				})
			}, 100)
			return () => clearInterval(interval)
		}
	}, [isActive, setIsActive])

	return (
		<div className='w-full flex flex-col items-center justify-center gap-4'>
			<progress
				className={'w-4/6 fill-green-500'}
				value={progress}
				max='100'
			/>
			{batchId}
		</div>
	)
}
