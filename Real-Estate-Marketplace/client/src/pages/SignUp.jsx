import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'
import OAuth from '../components/OAuth'

function SignUp() {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    try{
      setLoading(true)
      const res = await fetch('/api/auth/signup',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const userData = await res.json();
      console.log(userData);

      if(userData.success === false){
        setError(data.message)
        setLoading(false)
        return
      }
      
      setLoading(false)
      setError(null)
      navigate('/signin')
    }
    catch(err){
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>

      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>

      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input 
          name='username' 
          type='text' 
          placeholder='Username' 
          className='border p-3 rounded-lg'
          onChange={handleChange}>
        </input>

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
          {loading ? 'Loading...' : 'Sign Up'}
        </button>

        <OAuth />
        
      </form>

      <div className='flex gap-2 mt-5'>
        <p>Already have an account ?</p>
        <Link to='/signin'>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>

      {error && <p className='text-red-500 mt-5'>{error}</p>}
      
    </div>
  )
}

export default SignUp
