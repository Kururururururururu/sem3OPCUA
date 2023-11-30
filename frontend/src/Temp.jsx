import { useEffect, useState } from 'react'
import BeerButtons from './components/beer-components/button/beer-buttons.jsx'
import BeerContainers from './components/beer-components/container/beer-containers.jsx'
import StartStopButtons from './components/start-stop-buttons.jsx'

export default function Temp() {
	const [isActive, setIsActive] = useState(false)

	return (
		<div className={'container mx-auto mt-10 flex flex-col gap-4'}>
			<BeerButtons setIsActive={setIsActive}/>

			<div className='w-full h-1 bg-gray-500 my-4' />

			<div className='w-full flex items-center justify-center'>
				<ProgressBar
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

function ProgressBar({ isActive, setIsActive }) {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		if (isActive) {
			const state = new EventSource('/api/state')
			let currentState

			state.onmessage = function (event) {
				console.log('event', event.data)
				currentState = JSON.parse(event.data)
			}

			if(currentState != 6) {
				setIsActive(false)
			}
			
		}
	}, [isActive, setIsActive])

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
		</div>
	)
}
