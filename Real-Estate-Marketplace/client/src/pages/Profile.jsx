import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useRef, useEffect } from 'react' 
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from '../firebase'
import { Link } from 'react-router-dom'
import {updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutStart, signoutSuccess, signoutFailure} from '../redux/user/userSlice.js'

function Profile() {
  const { currentUser, loading, error } = useSelector((state) => {return state.user})
  const fileRef = useRef(null)
  const [file, setFile] = useState(undefined)
  const [filePerc, setFilePerc] = useState(0)
  const [fileUploadError, setFileUploadError] = useState(null)
  const [formData, setFormData] = useState({})
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [listings, setListings] = useState([])
  const [listingsError, setListingsError] = useState(null)
  const [deleteListingError, setDeleteListingError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if(file){
      handleFileUpload(file)
    }
  },[file])

  // We are uploading the file to the firebase cloud storage and retrieving its URL back from firebase cloud
  const handleFileUpload = (file) => {
    // creating storage for files using "getStorage" (from firebase) and passing app (our application) for the firebase to recognize
    const storage = getStorage(app);
    // appending current Time to the filename (to avoid redundancy when two files with same name are uploaded)
    const fileName = new Date().getTime() + file.name
    // reference to the storage of that particular file
    const storageRef = ref(storage, fileName)

    // uploadBytesResumable is used for upload process percentage
    const uploadTask = uploadBytesResumable(storageRef, file)

    // snapshot => piece of info from each state change (i.e each state of uploading progess)
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setFilePerc(Math.round(progress))
      },
      (err) => {
        setFileUploadError(err)
      },
      // callback function for getting file URL
      () => {
        // retrieving the file's URL from cloud storage
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setFormData({...formData, avatar: downloadURL})
          })
      }
    )

  }

  // INPUT CHANGE
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  // UPDATE USER
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(formData)
    try{
      dispatch(updateUserStart());
      const res = await fetch('/api/user/update/'+ currentUser._id + '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if(data.success === false){
        dispatch(updateUserFailure(data.message))
        return
      }

      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
    }
    catch(err){
      dispatch(updateUserFailure(err.message))
    }
    
  }

  // DELETE ACCOUNT
  const handleDelete = async () => {
    try{
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if(data.success === false){
        dispatch(deleteUserFailure(data.message))
        return
      }

      dispatch(deleteUserSuccess(data))
      
    }
    catch(err){
      dispatch(deleteUserFailure(err.message))
    }

  }

  // SIGN OUT
  const handleSignOut = async () => {
    try{
      dispatch(signoutStart())
      // no need to mention method for GET
      const res = await fetch('api/auth/signout')
      const data = await res.json()

      if(data.success === false){
        dispatch(signoutFailure(data.message))
        return
      }

      dispatch(signoutSuccess(data))
    }
    catch(err){
      dispatch(signoutFailure(err.message))
    }
  }

  // SHOW ALL LISTINGS
  const handleShowListings = async () => {
    try{
      setListingsError(null)
      const res = await fetch(`/api/user/listings/${currentUser._id}`)
      const data = await res.json()

      if(data.success === false){
        setListingsError(data.message)
        return
      }
      
      setListings(data)
    }
    catch(err){
      setListingsError(err.message)
    }
  }

  // DELETE LISTING
  const handleDeleteListing = async (id) => {
    try{
      setDeleteListingError(null)
      setDeleteLoading(true)
      const res = await fetch(`/api/listing/delete/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if(data.success === false){
        setDeleteListingError(data.message)
        setDeleteLoading(false)
        return
      }

      // Updating the listings after successful deletion from database
      setListings((prev) => prev.filter((listing) => {return listing._id != id}))
      setDeleteLoading(false)
    }
    catch(err){
      setDeleteListingError(err.message)
      setDeleteLoading(false)
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {/* IMAGE UPLOAD */}
        <img 
          onClick={() => fileRef.current.click()} 
          src={formData.avatar || currentUser.avatar} 
          alt="profile" 
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        >
        </img>

        {/* IMAGE INPUT HIDDEN */}
        <input 
          onChange={(e) => setFile(e.target.files[0])} 
          type="file" 
          ref={fileRef} 
          hidden 
          accept="image/*"
        >
        </input>

        {/* UPLOAD PROGRESS */}
        <p className='text-sm self-center'>
          { (fileUploadError) ? 
            <span className='text-red-700'>Image Upload Error</span> :

            (filePerc > 0 && filePerc < 100) ? 
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span> :

            (filePerc === 100) ?
            <span className='text-green-700'>Successfully Uploaded!</span> : 
            ""
          }
        </p>

        <input 
          onChange={handleChange} 
          type="text" 
          name="username" 
          defaultValue={currentUser.username}
          placeholder='Username' 
          className='border p-3 rounded-lg'
        >
        </input>
        <input 
          onChange={handleChange} 
          type="email" 
          name="email" 
          defaultValue={currentUser.email}
          placeholder='Email' 
          className='border p-3 rounded-lg'
        >
        </input>
        <input 
          onChange={handleChange} 
          type="password" 
          name="password" 
          defaultValue={currentUser.password}
          placeholder='Password' 
          className='border p-3 rounded-lg'
        >
        </input>

        <button disable={loading ? [loading] : undefined} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover-opacity:75 disabled:opacity-80'>{loading ? "Updating..." : "Update"}</button>

        <Link to='/createListing' className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-75'>
          Create Listing
        </Link>

      </form>

      <div className='flex justify-between mt-5'>
        <span onClick={handleDelete} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>

      <div className='flex justify-center'>
        <span onClick={handleShowListings} className='text-green-700 cursor-pointer'>Show Listings</span>
      </div>

      <p className='text-red-700 mt-4'>{error ? '!!!'+ error + '!!!' : ''}</p>
      <p className='text-green-700 mt-4'>{updateSuccess ? 'Updated successfully' : ''}</p>
      <p className='text-red-700 mt-4'>{listingsError ? listingsError : ""}</p>
      
      {listings && listings.length > 0 && 
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
          {listings.map((listing) => {
            return(
              <div key={listing._id} className='flex justify-between items-center border rounded-lg p-3 gap-4'>
                <Link to={`/listing/${listing._id}`}>
                  <img src={listing.imageUrls[0]} alt='cover' className='h-24 w-24 object-contain'></img>
                </Link>
                <Link to={`/listing/${listing._id}`} className='text-slate-700 font-semibold flex-1 hover:underline truncate'>
                  <p>{listing.name}</p>
                </Link>
                
                <div className='flex flex-col items-center'>
                  <button onClick={() => handleDeleteListing(listing._id)} className='text-red-700'>{deleteLoading ? "DELETING..." : "DELETE"}</button>
                  <Link to={`/updateListing/${listing._id}`}>
                    <button className='text-green-700'>EDIT</button>
                  </Link>
                </div>

              </div>
            )
          })}
          {deleteListingError && <p className='text-red-500 text-sm'>{deleteListingError}</p>}
        </div>
      }
      
    </div>
  )
}

export default Profile
