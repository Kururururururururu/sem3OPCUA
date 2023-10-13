import React from 'react'
import { twMerge } from 'tailwind-merge'

const Button = ({ children, className, ...props }) => {
	return (
		<button
			className={twMerge('bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-fit', className)}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button
