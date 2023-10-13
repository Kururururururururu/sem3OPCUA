import { useEffect, useState } from 'react'
import Button from './components/button'
import Dropdown from './components/dropdown'

export default function App() {
	const [data, setData] = useState()

	const buttons = [
		{
			text: 'Reset',
		},
		{
			text: 'Start',
		},
		{
			text: 'Stop',
		},
		{
			text: 'Abort',
		},
		{
			text: 'Clear',
		},
	]

	const dropdownOptions = ['barley', 'hops', 'malt', 'wheat', 'yeast']

	useEffect(() => {
		const sse = new EventSource('/api', { withCredentials: true })
		sse.onmessage = (e) => {
			try {
				setData(JSON.parse(e.data))
				// console.log(JSON.parse(e.data))
			} catch (e) {
				console.error(e)
			}
		}
		sse.onerror = () => {
			// error log here
			sse.close()
		}
		sse.onopen = () => {
			console.log('sse opened')
		}
		return () => {
			sse.close()
		}
	}, [])

	function handleButtonClick(button) {
		fetch(`/api/${button.text.toLowerCase()}`, { method: 'POST' })
			.then((res) => res.json())
			.then((data) => console.log(data))
	}

	return (
		<div className={'min-h-screen bg-black'}>
			<div className='p-4 space-y-4'>
				<h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>OPCUA Server Dashboard</h1>
				<div className='grid grid-cols-2 gap-4'>
					<div className='p-4 rounded-lg bg-white shadow dark:bg-gray-800'>
						<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Temperature</h2>
						<p className='text-gray-500 dark:text-gray-400'>{data ? '72.5°F' : 'Loading...'}</p>
					</div>
					<div className='p-4 rounded-lg bg-white shadow dark:bg-gray-800'>
						<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Vibration</h2>
						<p className='text-gray-500 dark:text-gray-400'>{data ? '15.2Hz' : 'Loading...'}</p>
					</div>
					<div className='p-4 rounded-lg bg-white shadow dark:bg-gray-800'>
						<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Maintenance Status</h2>
						<p className='text-gray-500 dark:text-gray-400'>{data ? 'Good' : 'Loading...'}</p>
					</div>
					<div className='p-4 rounded-lg bg-white shadow dark:bg-gray-800'>
						<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Batches Completed</h2>
						<p className='text-gray-500 dark:text-gray-400'>{data ? '1200' : 'Loading...'}</p>
					</div>
					<div className='p-4 rounded-lg bg-white shadow dark:bg-gray-800'>
						<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Batches Failed</h2>
						<p className='text-gray-500 dark:text-gray-400'>{data ? '5' : 'Loading...'}</p>
					</div>
				</div>
				<div className='flex space-x-4'>
					{buttons.map((button, index) => (
						<Button
							key={index}
							text={button.text}
							onClick={() => handleButtonClick(button)}
						>
							{button.text}
						</Button>
					))}
					<Dropdown options={dropdownOptions} />
				</div>
				<div className={'mt-10'}>
					<pre className={'text-white'}>{JSON.stringify(data, null, 2)}</pre>
				</div>
			</div>
		</div>
	)
}
