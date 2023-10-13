import React from 'react'
import { NavLink } from 'react-router-dom'

const Header = () => {
	const defaultButtonClasses = 'block px-4 py-2 rounded-md'
	return (
		<header className='bg-gray-800 text-white'>
			<div className='mx-auto flex justify-between items-center py-4'>
				<nav className='flex-grow'>
					<button className='absolute left-4 text-white font-bold py-2 px-4 rounded-full bg-red-500 hover:bg-red-700'>
						STOP
					</button>
					<ul className='flex justify-center items-center gap-4'>
						<li>
							<NavLink
								to='/'
								className={({ isActive, isPending }) =>
									isPending
										? 'bg-blue-500 ' + defaultButtonClasses
										: isActive
										? 'bg-pink-800 ' + defaultButtonClasses
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
										? 'bg-blue-500 ' + defaultButtonClasses
										: isActive
										? 'bg-pink-800 ' + defaultButtonClasses
										: defaultButtonClasses
								}
							>
								Analytics
							</NavLink>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	)
}

export default Header
