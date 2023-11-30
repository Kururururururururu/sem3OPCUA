export default function BeerContainer({ percent }) {
	return (
		<div
			className={
				'flex flex-col relative w-full h-full justify-center items-center border border-gray-500 rounded-md p-20'
			}
		>
			<div
				className='absolute bottom-0 left-0 w-full bg-green-500'
				style={{
					height: `${percent}%`,
				}}
			/>
		</div>
	)
}
