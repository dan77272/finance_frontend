'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import Navbar from "../components/Navbar";

interface RegisterForm {
    email: string;
    username: string;
    password: string;
    confirmPassword: string; // Added for password confirmation
}

interface APIResponse {
    message: string;
}

export default function Register() {

    const router = useRouter();

    const [formData, setFormData] = useState<RegisterForm>({
        email: '',
        username: '',
        password: '',
        confirmPassword: '' // Initial state for confirmation field
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Optional success message

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Basic client-side validation for password confirmation
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        const res = await fetch(`http://localhost:8080/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                username: formData.username,
                password: formData.password,
            })
        });

        if (res.ok) {
            setSuccessMessage("Account created successfully! Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000); // Redirect to login after a delay
        } else {
            const errorData: APIResponse = await res.json();
            setErrorMessage(errorData.message || 'Something went wrong');
        }
    }

    return (
        <div>
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="absolute inset-0 bg-cover bg-no-repeat -z-10" style={{backgroundImage: "url('background.webp')"}}></div>
                <div className="absolute inset-0 bg-black opacity-60 -z-10"></div>
                <Navbar/>
                <form className="flex flex-col justify-center items-center my-auto" onSubmit={handleSubmit}>
                    <label className="text-white text-lg">Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        required
                        className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"
                    />
                    <label className="text-white text-lg">Username</label>
                    <input 
                        value={formData.username} 
                        name="username" 
                        onChange={handleChange}
                        required
                        className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"
                    />
                    <label className="text-white text-lg">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange}
                        required
                        className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"
                    />
                    <label className="text-white text-lg">Confirm Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleChange}
                        required 
                        className="mb-10 border-gray-300 border-[1px] outline-blue-900 outline-1 h-[30px] w-[300px] pl-2 py-1"
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-900 px-10 py-2 rounded-md text-white"
                    >
                        Create Account
                    </button>
                </form>
                {errorMessage && <p className="text-red-700">{errorMessage}</p>}
                {successMessage && <p className="text-green-700">{successMessage}</p>}
            </div>
        </div>
    );
}
