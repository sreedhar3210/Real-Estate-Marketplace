import { Link } from 'react-router-dom'
import { MdLocationOn } from 'react-icons/md'

function ListingCard({listing}) {
    return (
        <div className='bg-white shadow-md hover:shadow-lg tranistion-shadow overflow-hidden rounded-lg w-full sm:w-[300px]'>
            <Link to={`/listing/${listing._id}`}>

                <img 
                    src={listing.imageUrls[0]} 
                    alt='cover'
                    className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300'
                >
                </img>

                <div className='p-3 flex flex-col gap-2 w-full'>

                    <p className='truncate text-lg font-semibold text-slate-700'>{listing.name}</p>
                    
                    <div className='flex items-center gap-1 px-1'>
                        <MdLocationOn className='h-4 w-4 text-green-700'/>
                        <p className='text-sm text-grey-600 truncate w-full'>{listing.address}</p>
                    </div>

                    <p className='text-sm text-grey-600 line-clamp-3'>{listing.description}</p>

                    <p className='text-slate-500 mt-1 font-semibold'>
                        Rs.{' '}
                        {listing.offer ? listing.discountPrice .toLocaleString('en-IN') : listing.regularPrice.toLocaleString('en-IN')}
                        {listing.type === 'rent' && ' / month'}
                    </p>

                    <div className='text-slate-700 flex gap-6'>
                        <div className='font-bold text-xs'>
                            {listing.bedrooms > 1 ? `${listing.bedrooms} beds` : `${listing.bedrooms} bed`}
                        </div>
                        <div className='font-bold text-xs'>
                            {listing.bathrooms > 1 ? `${listing.bathrooms} baths` : `${listing.bathrooms} bath`}
                        </div>
                    </div>

                </div>

            </Link>
        </div>
    )
}

export default ListingCard
