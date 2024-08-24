import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { signinStart, signinSuccess, signinFailure } from '../redux/user/userSlice'
import OAuth from '../components/OAuth'

function SignIn() {
  const [formData, setFormData] = useState({})
  const {error, loading} = useSelector((state) => state.user) 
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try{
      dispatch(signinStart())
      const res = await fetch('/api/auth/signin',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const userData = await res.json();

      if(userData.success === false){
        dispatch(signinFailure(userData.message))
        return
      }
      
      dispatch(signinSuccess(userData))
      navigate('/')
    }
    catch(err){
      dispatch(signinFailure(err.message))
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>

      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>

      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input 
          name='email' 
          type='email' 
          placeholder='Email' 
          className='border p-3 rounded-lg'
          onChange={handleChange}>
        </input>

        <input 
          name='password' 
          type='password' 
          placeholder='Password' 
          className='border p-3 rounded-lg'
          onChange={handleChange}>
        </input>
        
        <button 
          disable={loading ? [loading] : undefined}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-75'>
          {loading ? 'Loading...' : 'Sign In'}
        </button>

        <OAuth />

      </form>

      <div className='flex gap-2 mt-5'>
        <p>New to the Market?</p>
        <Link to='/signup'>
          <span className='text-blue-700'>Sign up</span>
        </Link>
      </div>

      {error && <p className='text-red-500 mt-5'>{error}</p>}
      
    </div>
  )
}

export default SignIn
