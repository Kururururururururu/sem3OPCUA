export default function BeerButton({beer, brewBeer}) {
    return (
        <button
            className={'flex flex-col justify-center items-center border border-gray-500 rounded-md p-20 w-1/6'}
            onClick={brewBeer}
        >
            <h1 className={'text-2xl font-bold text-gray-900'}>{beer}</h1>
        </button>
    )
}