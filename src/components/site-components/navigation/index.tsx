import { UserButton } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
    user?: null | User
}

const Navigation = ({user}: Props) => {
  return (
    <div className='p-4 flex items-center justify-between relative'>
        <aside className='flex items-center gap-2'>
            <Image 
             src={'/assets/bb-whitebg.svg'}
             width={40}
             height={40}
             alt='blakbox logo'
            />
            <span className='text-xl font-bold'>.</span>
        </aside>
        <nav className='hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]'>
        <ul className='flex items-center justify-center gap-8'>
            <Link href={'#'} >Pricing</Link>
            <Link href={'#'} >About</Link>
            <Link href={'#'} >Documentation</Link>
            <Link href={'#'} >Features</Link>
        </ul>
        </nav>
        <aside className='flex gap-2 items-center'>
            <Link href={'/market'}
                className='bg-primary text-white px-4 p-2 rounded-md hover:bg-primary/80'
            >
                login
            </Link>
            <UserButton />
        </aside>
    </div>
  )
}

export default Navigation;
