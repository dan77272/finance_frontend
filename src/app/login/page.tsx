'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import Navbar from "../components/Navbar";

interface LoginForm{
    username: string;
    password: string;
}

interface APIResponse{
    message: string;
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
            body: JSON.stringify(formData)
        })
        if(res.ok){
            const data = await res.json()
            localStorage.setItem('token', data.token)
            localStorage.setItem('userId', data.userId)
            router.push("/dashboard")
        }else{
            const errorData: APIResponse = await res.json()
            setErrorMessage(errorData.message || 'Login failed')
        }
    }

    return (
        <div>
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="absolute inset-0 bg-cover bg-no-repeat -z-10" style={{backgroundImage: "url('background.webp')"}}></div>
                <div className="absolute inset-0 bg-black opacity-60 -z-10"></div>
                <Navbar/>
                <form className="flex flex-col justify-center items-center my-auto" onSubmit={handleSubmit}>
                    <label className="text-white text-lg">Username</label>
                    <input value={formData.username} name="username" onChange={handleChange} required className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"/>
                    <label className="text-white text-lg">Password</label>
                    <input value={formData.password} name="password" onChange={handleChange} required type="password" className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"/>
                    <button type="submit" className="bg-blue-900 px-10 py-2 rounded-md text-white">Log in</button>
                </form>
                {errorMessage && <p className="text-red-700">{errorMessage}</p>}
            </div>

        </div>
    )
}