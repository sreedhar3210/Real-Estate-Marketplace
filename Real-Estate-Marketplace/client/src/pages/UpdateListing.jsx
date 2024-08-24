import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { useState, useEffect } from 'react'
import {app} from '../firebase'
import { useSelector } from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'


function UpdateListing() {
  const navigate = useNavigate()
  const params = useParams()
  const {currentUser} = useSelector((state) => state.user)
  const [files, setFiles] = useState([]) 
  const [imageUploadError, setImageUploadError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    regularPrice: 0,
    discountPrice: 0,
    bathrooms: 1,
    bedrooms: 1,
    furnished: false,
    parking: false,
    type: "rent",
    offer: false,
    imageUrls: [],
  })

  // We can't have an async function in useEffect directly, so we have to declare it first and call it at end.
  useEffect(() => {
    const fetchListing = async () => {
        const listingId = params.listingId
        const res = await fetch(`/api/listing/get/${listingId}`)
        const data = await res.json()

        if(data.success === false){
            console.log(data.message)
            return
        }
        
        const {userRef, ...rest} = data
        setFormData(rest)
    }

    fetchListing()
  }, [])

  // IMAGE UPLOAD
  const handleImagesUpload = (e) => {
    if(files.length > 0 && files.length + formData.imageUrls.length < 7){
      setUploading(true)
      setImageUploadError(false)
      // we are uploading more than one image i.e more than one asynchronous process each returning a promise -> array of promises
      const promises = []

      for(let i=0; i<files.length; i++){
        // storeImage -> stores images on firebase and returns a promise containing the imageURL downloaded from firebase
        promises.push(storeImage(files[i]))
      }
      // wait for all promises -> iff all promises gets returned .then function gets executed
      Promise.all(promises)
      .then((urls) => {
        // we are adding these urls to already existing imageUrls (not assigning)
        setFormData({...formData, imageUrls: formData.imageUrls.concat(urls)})
        setImageUploadError(false)
        setUploading(false)
      })
      .catch((err) => {
        setImageUploadError("Image Upload Failed (2 MB max per image)")
        setUploading(false)
      })

    }
    else{
      setImageUploadError("Max limit! - 6 images")
      setUploading(false)
    }
  }

  // STORE IMAGE IN FIREBASE
  const storeImage = async(file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app)
      const fileName = new Date().getTime() + file.name
      const storageRef = ref(storage, fileName)
      const uploadTask = uploadBytesResumable(storageRef, file)

      // in uploadTask on state change -> if (err) reject(err), if no error callback function gets called and downloads imageURL
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`${progress}% done`)
        },
        (err) => {
          reject(err)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
          })
        }
      )

    })
  }

  // REMOVE UPLOADED IMAGE
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      // we are returning all the url's that do not match the "index" url and filtering those that match ('_' is used in place of 'url' cause we are not using url)
      imageUrls: formData.imageUrls.filter((_, i) => { return i !== index})
    })
  }

  // INPUT CHANGE
  const handleChange = (e) => {
    const {name} = e.target
    if(name === "sale" || name === "rent"){
      setFormData({...formData, type: name})
    }
    else if(name === "parking" || name === "furnished" || name === "offer"){
      setFormData({...formData, [name]: e.target.checked})
    }
    else{
      setFormData({...formData, [name]: e.target.value})
    }
  }

  // FORM SUBMIT
  const handleSubmit = async(e) => {
    e.preventDefault()
    try{
      if(formData.imageUrls.length < 1) return setError("Atleast one image required!")
      if(+formData.regularPrice < +formData.discountPrice) return setError("Discounted Price must be lower than Regular Price")
      setLoading(true)
      setError(false)

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...formData, userRef: currentUser._id}),
      })
      const data = await res.json()
      setLoading(false)

      if(data.success === false){
        setError(data.message)
        return
      }
      
      navigate(`/listing/${data._id}`)
    }
    catch(err){
      setError(err.message)
      setLoading(false)
    }
    
  }



  return (
    <main className='p-3 max-w-4xl mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>Update Listing</h1>

        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
          {/* LEFT DIV */}
          <div className='flex flex-col gap-4 flex-1'>
            <input 
              type="text" 
              name="name" 
              onChange={handleChange}
              placeholder='Name' 
              className='border p-3 rounded-lg' 
              maxLength='62' 
              minLength='10' 
              required
              /* when value is implicity mentioned -> its calue does not get changes when typing (only changed through hooks)*/
              value={formData.name}  
            >
            </input>

            <input 
              type="text" 
              name="description" 
              onChange={handleChange}
              placeholder='Description' 
              className='border p-3 rounded-lg' 
              maxLength='1000' 
              minLength='10' 
              required
              value={formData.description}
            >
            </input>

            <input 
              type="text" 
              name="address" 
              onChange={handleChange}
              placeholder='Address' 
              className='border p-3 rounded-lg' 
              maxLength='62' 
              minLength='10' 
              required
              value={formData.address}
            >
            </input>

            {/* DIV for ALL THE CHECKBOXES */}
            <div className='flex gap-6 flex-wrap'>
              {/* DIV for EACH CHECKBOX */}
              <div className='flex gap-2'>
                <input type="checkbox" name="sale" onChange={handleChange} checked={formData.type === "sale"} className='w-5'></input>
                <span>Sell</span>
              </div>

              <div className='flex gap-2'>
                <input type="checkbox" name="rent" onChange={handleChange} checked={formData.type === "rent"} className='w-5'></input>
                <span>Rent</span>
              </div>

              <div className='flex gap-2'>
                <input type="checkbox" name="parking" onChange={handleChange} checked={formData.parking} className='w-5'></input>
                <span>Parking Spot</span>
              </div>

              <div className='flex gap-2'>
                <input type="checkbox" name="furnished" onChange={handleChange} checked={formData.furnished} className='w-5'></input>
                <span>Furnished</span>
              </div>

              <div className='flex gap-2'>
                <input type="checkbox" name="offer" onChange={handleChange} checked={formData.offer} className='w-5'></input>
                <span>Offer</span>
              </div>
            </div>

            {/* DIV for Beds, Baths & Prices */}
            <div className='flex flex-wrap gap-6'>
              {/* EACH DIV */}
              <div className='flex items-center gap-2'>
                <input type="number" name="bedrooms" onChange={handleChange} value={formData.bedrooms} min="1" max="10" required className='p-3 border border-gray-300 rounded-lg'></input>
                <p>Beds</p>
              </div>

              <div className='flex items-center gap-2'>
                <input type="number" name="bathrooms" onChange={handleChange} value={formData.bathrooms} min="1" max="10" required className='p-3 border border-gray-300 rounded-lg'></input>
                <p>Baths</p>
              </div>

              <div className='flex items-center gap-2'>
                <input type="number" name="regularPrice" onChange={handleChange} value={formData.regularPrice} min="0" max="10000000" required className='p-3 border border-gray-300 rounded-lg'></input>
                <div className='flex flex-col items-center'>
                  <p>Regular Price</p>
                  {formData.type === "rent" && <span className='text-xs'>(Rs / month)</span>}
                </div>
              </div>

              {formData.offer && 
                <div className='flex items-center gap-2'>
                  <input type="number" name="discountPrice" onChange={handleChange} value={formData.discountPrice} min="0" max="10000000" required className='p-3 border border-gray-300 rounded-lg'></input>
                  <div className='flex flex-col items-center'>
                    <p>Discounted Price</p>
                    {formData.type === "rent" && <span className='text-xs'>(Rs / month)</span>}
                  </div>
                </div>
              }
              
            </div>

          </div>

          {/* RIGHT DIV */}
          <div className='flex flex-col flex-1 gap-4'>

            <p className='font-semibold'>
              Images: 
              <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
            </p>

            <div className='flex gap-4'>
              <input onChange={(e) => {setFiles(e.target.files)}} type='file' name="images" accept='image/*' multiple className='p-3 border border-gray-300 rounded w-full'></input>
              {/* If any of the form buttons get clicked, the form gets submitted - To prevent that button is implicity declared as type="button" */}
              <button onClick={handleImagesUpload} type="button" disable={uploading ? uploading : undefined} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>{uploading ? "Uploading..." : "Upload"}</button>
            </div>

            {formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => {
              return(
                <div key={index} className='flex justify-between p-3 border items-center'>
                  <img src={url} alt="image" className='w-20 h-20 object-contain rounded-lg'></img>
                  <button type="button" onClick={() => { return handleRemoveImage(index)}} className='p-3 text-red-500 rounded-lg uppercase hover:opacity-95 disabled:opacoti-80'>Delete</button>
                </div>
              )
            })}
            
            <p className='text-red-500 text-sm'>{imageUploadError && imageUploadError}</p>

            <button disable={(loading || uploading) ? (loading || uploading) : undefined} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-75 disabled:opacity-80'>{loading ? "Updating..." : "Update Listing"}</button>
            
            {error && <p className='text-red-500 text-sm'>{error}</p>}

          </div>
          
        </form>
    </main>
  )
}

export default UpdateListing
