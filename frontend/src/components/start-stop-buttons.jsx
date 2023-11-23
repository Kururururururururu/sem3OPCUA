import Button from "./button.jsx";

export default function StartStopButtons({setIsActive}) {

    return (
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
    )
}