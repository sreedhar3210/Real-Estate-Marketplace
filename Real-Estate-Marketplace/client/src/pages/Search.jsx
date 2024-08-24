import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ListingCard from '../components/ListingCard'

function Search() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [listings, setLisitngs] = useState({})
    const [showMore, setShowMore] = useState(false)
    const [sideBarData, setSideBarData] = useState({
        searchTerm: "",
        type: "all",
        parking: false,
        furnished: false,
        offer: false,
        sort: 'created_at',
        order: 'desc',
    })
    
    // FORM CHANGE
    const handleChange = (e) => {
        const name = e.target.name
        const value = e.target.value
        const checked = e.target.checked
        
        if(name === 'all' || name === 'rent' || name === 'sale'){
            setSideBarData({...sideBarData, type: name})
        }
        else if(name === 'parking' || name === 'offer' || name === 'furnished'){
            setSideBarData({...sideBarData, [name]: checked || checked === 'true' ? true : false})
        }
        else if(name === 'searchTerm'){
            setSideBarData({...sideBarData, [name]: value})
        }
        else{
            const sort = value.split('_')[0] || 'created_at'
            const order = value.split('_')[1] || 'desc'

            setSideBarData({...sideBarData, sort, order})
        }
    }

    // FORM SUBMIT
    const handleSubmit = (e) => {
        e.preventDefault()

        const urlParams = new URLSearchParams() 

        urlParams.set('searchTerm', sideBarData.searchTerm)
        urlParams.set('type', sideBarData.type)
        urlParams.set('parking', sideBarData.parking)
        urlParams.set('furnished', sideBarData.furnished)
        urlParams.set('offer', sideBarData.offer)
        urlParams.set('sort', sideBarData.sort)
        urlParams.set('order', sideBarData.order)
        const searchQuery = urlParams.toString()

        navigate(`/search?${searchQuery}`)
    }

    // UPDATE sideBarData & FETCH Data
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        
        const searchTermFromUrl = urlParams.get('searchTerm')
        const typeFromUrl = urlParams.get('type')
        const parkingFromUrl = urlParams.get('parking')
        const furnishedFromUrl = urlParams.get('furnished')
        const offerFromUrl = urlParams.get('offer')
        const sortFromUrl = urlParams.get('sort')
        const orderFromUrl = urlParams.get('order')
        
        if(searchTermFromUrl || typeFromUrl || parkingFromUrl || furnishedFromUrl || offerFromUrl || sortFromUrl || orderFromUrl){
            setSideBarData({
                searchTerm: searchTermFromUrl || '',
                type: typeFromUrl || 'all',
                parking: parkingFromUrl === 'true' ? true : false,
                furnished: furnishedFromUrl === 'true' ? true : false,
                offer: offerFromUrl === 'true' ? true : false,
                sort: sortFromUrl || 'created_at',
                order: orderFromUrl || 'desc',
             })
        }

        const fetchListings = async () => {
            setLoading(true)
            setShowMore(false)
            const searchQuery = urlParams.toString()
            try{
                const res = await fetch(`/api/listing/get?${searchQuery}`)
                const data = await res.json()

                if(data.success === false){
                    setLoading(false)
                }
                
                if(data.length > 8){
                    setShowMore(true)
                }
                else{
                    setShowMore(false)
                }
                setLisitngs(data)
                setLoading(false)
            }
            catch(err){
                setLoading(false)
            }
        }
        fetchListings()

    }, [location.search])

    const onShowMoreClick = async () => {
        const noOfListings = listings.length
        const startIndex = noOfListings

        const urlParams = new URLSearchParams(location.search)
        urlParams.set('startIndex', startIndex)
        const searchQuery = urlParams.toString()

        const res = await fetch(`/api/listing/get?${searchQuery}`)
        const data = await res.json()
        if(data.length < 9){
            setShowMore(false)
        }
        // too add an array to previous array also we use spread operator
        setLisitngs([...listings, ...data])
    }


    return (
        <div className='flex flex-col md:flex-row'>

            {/* OPTIONS */}
            <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-8'>

                    {/* SEARCH TERM */}
                    <div className='flex items-center gap-2'>
                        <label className='whitespace-nowrap font-semibold'>Search Term:</label>
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder='Search...'
                            className='border rounded-lg p-3 w-full'
                            onChange={handleChange}
                            value={sideBarData.searchTerm}
                        />
                    </div>

                    {/* TYPE */}
                    <div className='flex gap-2 flex-wrap items-center'>
                        <label className='font-semibold'>Type:</label>
                        <div className='flex gap-2'>
                            <input
                                type="checkbox"
                                name="all"
                                className='w-5'
                                onChange={handleChange}
                                checked={sideBarData.type === 'all'}
                            />
                            <span>Rent & Sale</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                type="checkbox"
                                name="rent"
                                className='w-5'
                                onChange={handleChange}
                                checked={sideBarData.type === 'rent'}
                            />
                            <span>Rent</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                type="checkbox"
                                name="sale"
                                className='w-5'
                                onChange={handleChange}
                                checked={sideBarData.type === 'sale'}
                            />
                            <span>Sale</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                type="checkbox"
                                name="offer"
                                className='w-5'
                                onChange={handleChange}
                                checked={sideBarData.offer}
                            />
                            <span>Offer</span>
                        </div>
                    </div>

                    {/* AMENITIES */}
                    <div className='flex gap-2 flex-wrap items-center'>
                        <label className='font-semibold'>Amenities:</label>
                        <div className='flex gap-2'>
                            <input
                                type="checkbox"
                                name="parking"
                                className='w-5'
                                onChange={handleChange}
                                checked={sideBarData.parking}
                            />
                            <span>Parking</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                type="checkbox"
                                name="furnished"
                                className='w-5'
                                onChange={handleChange}
                                checked={sideBarData.furnished}
                            />
                            <span>Furnished</span>
                        </div>
                    </div>

                    {/* SORT */}
                    <div className='flex items-center gap-2'>
                        <label className='font-semibold'>Sort:</label>
                        <select onChange={handleChange} defaultValue={'create_at_desc'} name='sort_order' className='border rounded p-3'>
                            <option value={'regularPrice_desc'}>Price high to low</option>
                            <option value={'regularPrice_asc'}>Price low to high</option>
                            <option value={'createdAt_desc'}>Latest</option>
                            <option value={'createdAt_asc'}>Oldest</option>
                        </select>
                    </div>

                    <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hocer:opacity:80'>
                        Search
                    </button>

                </form>
            </div>

                {/* RESULTS */}
            <div className='flex-1'>

                <h1 className='text-3xl font-semiboldborder-b p-3 text-slate-700'>Listing Results:</h1>
                
                <div className='p-7 flex flex-wrap gap-4'>

                    {!loading && listings.length === 0 && (
                        <p className='text-xl text-slate-700'>No Listings Found</p>
                    )}
                    {loading && (
                        <p className='text-xl text-slate-700 text-center w-full'>Loading...</p>
                    )}

                    {
                        !loading && listings && listings.length > 0 &&
                        listings.map((listing) => {
                            return(
                                <ListingCard key={listing._id} listing={listing} />
                            )
                        })
                    }

                    {showMore && (
                        <button onClick={onShowMoreClick} className='text-green-700 hover:underline p-7 text-center w-full'>Show more</button>
                    )}

                </div>

            </div>

        </div>
    )
}

export default Search
