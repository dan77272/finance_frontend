'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

interface LoginForm{
    username: string;
    password: string;
}

interface APIResponse{
    message: string;
    userId?: string;
}

export default function Login(){

    const router = useRouter()

    const [formData, setFormData] = useState<LoginForm>({
        username: '',
        password: ''
    })
    const [errorMessage, setErrorMessage] = useState('')


    function handleChange(e: ChangeEvent<HTMLInputElement>){
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })

    }

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
    })
    if(res.ok){
        // Immediately verify login by fetching profile
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
            credentials: 'include'
        });
        if (profileRes.ok) {
            // Optionally store user info in React context, Redux, etc.
            // or just redirect
            router.push("/dashboard")
        } else {
            setErrorMessage('Login failed: could not verify session')
        }
    } else {
        const errorData: APIResponse = await res.json()
        setErrorMessage(errorData.message || 'Login failed')
    }
}


    return (
        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-black to-neutral-700 min-h-screen pt-16">
                <div>
                    <form className="flex flex-col justify-center items-center my-auto mb-10" onSubmit={handleSubmit}>
                        <label className="text-white text-lg">Username</label>
                        <input value={formData.username} name="username" onChange={handleChange} required className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"/>
                        <label className="text-white text-lg">Password</label>
                        <input value={formData.password} name="password" onChange={handleChange} required type="password" className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"/>
                        <button type="submit" className="bg-blue-900 px-10 py-2 rounded-md text-white">Log in</button>
                    </form>
                    {errorMessage && <p className="text-red-700 text-center">{errorMessage}</p>}
                </div>
            </div>
    )
}