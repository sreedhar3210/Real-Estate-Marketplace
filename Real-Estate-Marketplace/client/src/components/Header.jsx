import React from 'react'
import {FaSearch} from 'react-icons/fa'
import {Link, useNavigate, useResolvedPath} from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { set } from 'mongoose'

function Header() {
  const {currentUser} = useSelector((state) => state.user)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()


  const handleSubmit = (e) => {
    e.preventDefault();

    //get url from URLSearchParams
    const urlParams = new URLSearchParams(window.location.search)
    // set url from searchBar
    urlParams.set('searchTerm', searchTerm)

    const searchQuery = urlParams.toString()
    navigate(`/search?${searchQuery}`)
  }

  // to update searchBar from params
  useEffect(() => {
    //get url from URLSearchParams
    const urlParams = new URLSearchParams(location.search)
    // get searchTerm from url
    const searchBarTerm = urlParams.get('searchTerm')
    
    if(searchBarTerm){
      setSearchTerm(searchBarTerm)
    }
    else{
      setSearchTerm('')
    }

  }, [location.search])



  
  return (
    <header className='bg-slate-200 shadow-md'>

      <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>

        {/* LOGO */}
        <Link to="/">
        <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
          <span className='text-slate-500'>Ease</span>
          <span className='text-slate-700'>Estate</span>
        </h1>
        </Link>

        {/* SEARCH BAR */}
        <form onSubmit={handleSubmit} className='bg-slate-100 p-3 rounded-lg flex items-center'>
          <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} type='text' placeholder='Search...' className='bg-transparent focus:outline-none w-24 sm:w-64'></input>
          <button>
            <FaSearch className='text-slate-700'/>
          </button>
        </form>

        {/* HOME, ABOUT, SIGN-IN */}
        <ul className='flex gap-6'>
          <Link to="/">
            <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
          </Link>
          <Link to="/about">
            <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
          </Link> 
          <Link to="/profile">
            {currentUser ? ( <img src={currentUser.avatar} alt="profile" className='rounded-full h-7 w-7 object-cover'></img>) : <li className='text-slate-700 hover:underline'>Sign in</li>}
          </Link>
        </ul>

      </div>

    </header>
  )
}

export default Header
