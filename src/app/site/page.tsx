import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { pricingCards } from '@/lib/constants';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Home = () => {
  return (
    <>
      <section className='h-full w-full pt-36 mt-10 relative flex items-center justify-center flex-col'>
      {/* <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:4rem_4rem]" /> */}
      {/* <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:_4rem]" /> */}
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <p className='text-center'>
          Run your market all year round!
          </p>
        <div className='bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative'>
          <h1 className='text-9xl font-bold text-center md:text-[300px]'>
            BlakBox
          </h1>
        </div>
        <div className='flex justify-center items-center relative md:mt-[-70px]'>
          <Image 
            src={'/assets/comicon4.svg'}
            alt='preview image'
            height={1200}
            width={1200}
            className='rounded-tl-2xl rounded-tr-2xl border-2 border-muted'
          />
          <div className='bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10'></div>
        </div>
      </section>
      <section className='flex justify-center items-center flex-col gap-4 md:!mt-40 mt-[-60px]'>
        <h2 className='text-4xl text-center'> Choose what fits you</h2>
        <p className='text-muted-foreground text-center'>
          Our pricing plans are designed to meet the needs of both small and large marketplaces. {"you're"} not <br /> ready tp commit, you can start for free.
        </p>
        <div className='flex justify-center gap-4 flex-wrap mt-6'>
          {pricingCards.map((card) => (
            // WIP Wire Up free product from Stripe
            <Card 
                key={card.title} 
                className={clsx('w-[300px] flex flex-col justify-between mb-10', {'border-2 border-primary': card.title === "Unlimited Saas",})}
            >
              <CardHeader >
                <CardTitle className={clsx('', {'text-muted-foreground': card.title !== 'Unlimited Saas',})}>
                  {card.title}
                  </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className='text-4xl font-bold'>{card.price}</span>
                <span className='text-4xl font-bold'>/m</span>
              </CardContent>
              <CardFooter className='flex flex-col items-start gap-4'>
                <div>{card.features.map((feature) => (
                  <div 
                      key={feature} 
                      className='flex gap-2 items-center'
                  >
                    <Check className='text-muted-foreground' />
                    <p>{feature}</p>
                  </div>
                  ))}
                </div>
                <Link href={`/market?plan=${card.priceId}`} 
                      className={clsx('w-full text-center bg-primary p-2 rounded-md', {'!bg-muted-foreground': card.title !== "Unlimited Saas"})}
                >
                  Lets Get It
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home;
