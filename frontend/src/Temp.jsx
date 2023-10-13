import { useEffect, useState } from 'react'
import Button from './components/button'

export default function Temp() {
	const beers = ['Beer type 1', 'Beer type 2', 'Beer type 3', 'Beer type 4', 'Beer type 5']
	const [progress, setProgress] = useState(0)
	const [isActive, setIsActive] = useState(false)

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
	}, [isActive])

	return (
		<div className={'container mx-auto mt-10 flex flex-col gap-4'}>
			<div className={'flex gap-4'}>
				{beers.map((beer, index) => (
					<div
						key={index}
						className={'flex flex-col justify-center items-center border border-gray-500 rounded-md p-20'}
					>
						<h1 className={'text-2xl font-bold text-gray-900'}>{beer}</h1>
					</div>
				))}
			</div>

			<div className='w-full h-1 bg-gray-500 my-4'></div>

			<div className='w-full flex items-center justify-center'>
				<progress
					className={'w-4/6 fill-green-500'}
					value={progress}
					max='100'
				/>
			</div>
			<div className='w-full h-1 bg-gray-500 my-4'></div>
			<div className={'flex justify-between'}>
				<div className='flex gap-4'>
					<Button
						className={'bg-green-500 hover:bg-green-700'}
						onClick={() => setIsActive(true)}
					>
						Start
					</Button>
					<Button
						className={'bg-red-500 hover:bg-red-900'}
						onClick={() => setIsActive(false)}
					>
						Stop
					</Button>
				</div>
				<div className='flex'>
					{beers.map((_, index) => (
						<div
							key={index}
							className={
								'flex flex-col relative w-full h-full justify-center items-center border border-gray-500 rounded-md p-20'
							}
						>
							<div
								className='absolute bottom-0 left-0 w-full bg-green-500'
								style={{
									height: `${Math.floor(Math.random() * 100)}%`,
								}}
							></div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}