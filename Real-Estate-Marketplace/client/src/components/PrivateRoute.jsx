import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'

function PrivateRoute() {
    // checking whether there is a user signed in or not
    const { currentUser } = useSelector((state) => state.user)

    return (
        currentUser ? <Outlet /> : <Navigate to="/signin" />
    )
}

export default PrivateRoute
