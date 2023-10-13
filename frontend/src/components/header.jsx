import React from 'react'
import { NavLink } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
	const defaultButtonClasses = 'block px-4 py-2 rounded-md hover:bg-gray-700'
	return (
		<header className='bg-gray-800 text-white mx-auto flex justify-between items-center py-4'>
			<nav className='flex-grow'>
				<button className='absolute left-4 text-white font-bold py-2 px-4 rounded-full bg-red-500 hover:bg-red-700 flex gap-2 items-center justify-center'>
					<p>NØDSTOP</p>
					<FontAwesomeIcon icon={faHand} />
				</button>
				<ul className='flex justify-center items-center gap-4'>
					<li>
						<NavLink
							to='/'
							className={({ isActive, isPending }) =>
								isPending
									? twMerge(defaultButtonClasses, 'bg-blue-500 hover:bg-blue-700')
									: isActive
									? twMerge(defaultButtonClasses, 'bg-pink-800 hover:bg-pink-600')
									: defaultButtonClasses
							}
						>
							Brew
						</NavLink>
					</li>
					<li>
						<NavLink
							to='/analytics'
							className={({ isActive, isPending }) =>
								isPending
									? twMerge(defaultButtonClasses, 'bg-blue-500 hover:bg-blue-700')
									: isActive
									? twMerge(defaultButtonClasses, 'bg-pink-800 hover:bg-pink-600')
									: defaultButtonClasses
							}
						>
							Analytics
						</NavLink>
					</li>
				</ul>
			</nav>
		</header>
	)
}

export default Header
