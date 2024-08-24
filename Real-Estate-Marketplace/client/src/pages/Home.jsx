import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore from 'swiper'
import {Navigation} from 'swiper/modules'
import 'swiper/css/bundle'
import { useState, useEffect } from 'react'
import ListingCard from '../components/ListingCard'

function Home() {
  const [offerListings, setOfferListings] = useState([])
  const [saleListings, setSaleListings] = useState([])
  const [rentListings, setRentListings] = useState([])

  SwiperCore.use([Navigation])

  console.log(saleListings)

  useEffect(() => {
    const fetchOfferLisitings = async () => {
      try{
        const res = await fetch('/api/listing/get?offer=true&limit=4')
        const data = await res.json()

        setOfferListings(data)
        fetchRentListings()
      }
      catch(err){
        console.log(err)
      }
    }

    const fetchRentListings = async () => {
      try{
        const res = await fetch('/api/listing/get?type=rent&limit=4')
        const data = await res.json()

        setRentListings(data)
        fetchSaleListings()
      }
      catch(err){
        console.log(err)
      }
    }

    const fetchSaleListings = async () => {
      try{
        const res = await fetch('/api/listing/get?type=sale&limit=4')
        const data = await res.json()

        setSaleListings(data)
      }
      catch(err){
        console.log(err)
      }
    }

    fetchOfferLisitings()

  }, [])

  return (
    <div>

      {/* TITLE */}
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">

        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Find your next 
          <span className='text-slate-500'> perfect</span> 
          <br/> 
          place with ease
        </h1>

        <div className='text-grey-400 text-xs sm:text-sm'>
          Ease Estate will help you find your home fast, easy and comfortable.
          <br/>
          We have a wide range of properties for you to choose from.
        </div>

        <Link to={'/search'} className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'>Let's get started...</Link>

      </div>

      {/* SWIPER */}
      <Swiper navigation>
        {
          offerListings && offerListings.length > 0 &&
          offerListings.map((listing) => {
            return (
              <SwiperSlide key={listing._id}>
                  <div className='h-[500px]' style={{background: `url(${listing.imageUrls[0]}) center no-repeat`, backgroundSize: 'cover'}}></div>
              </SwiperSlide>
            )
          })
        }
      </Swiper>
      
      {/* LISTINGS */}
      <div className='mx-auto max-w-7xl p-3 flex flex-col gap-8 my-10'>
        {
          offerListings && offerListings.length > 0 && (
            <div className=''>
              <div className='my-3'>

                <h2 className='text-2xl font-semibold text-slate-600'>Recent Offers</h2>

                <Link to={'/search?offer=true'} className='text-sm text-blue-800 hover:underline'>Show more offers</Link>

                <div className='flex flex-wrap gap-4'>
                  {offerListings.map((listing) => (
                    <ListingCard listing={listing} key={listing._id} />
                  ))}
                </div>

              </div>
            </div>
          )
        }

        {
          rentListings && rentListings.length > 0 && (
            <div className=''>
              <div className='my-3'>

                <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>

                <Link to={'/search?type=rent'} className='text-sm text-blue-800 hover:underline'>Show more places for rent</Link>

                <div className='flex flex-wrap gap-4'>
                  {rentListings.map((listing) => (
                    <ListingCard listing={listing} key={listing._id} />
                  ))}
                </div>

              </div>
            </div>
          )
        }

        {
          saleListings && saleListings.length > 0 && (
            <div className=''>
              <div className='my-3'>

                <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sale</h2>

                <Link to={'/search?type=sale'} className='text-sm text-blue-800 hover:underline'>Show more places for sale</Link>

                <div className='flex flex-wrap gap-4'>
                  {saleListings.map((listing) => (
                    <ListingCard listing={listing} key={listing._id} />
                  ))}
                </div>

              </div>
            </div>
          )
        }
      </div>

    </div>
  )
}

export default Home
