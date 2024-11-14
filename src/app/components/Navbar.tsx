'use client'

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar(){

    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [token, setToken] = useState<string | null>('')

    useEffect(() => {
        const storedToken = localStorage.getItem('token') || ''
        setToken(storedToken)
    }, [])

    function handleSignOut(){
        localStorage.removeItem('token')
        localStorage.removeItem('userId')

        router.push('/login')

    }

    return (
        <nav className="bg-green-600 w-full" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link href="/">
                  <Image
                    src="/logo.webp"
                    height={50}
                    width={50}
                    alt="Logo"
                    className="rounded-lg"
                  />
              </Link>
            </div>
  
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 text-white">
                {token && 
                    <Link href="/dashboard">
                        <p className="text-base font-medium hover:text-gray-200">Dashboard</p>
                    </Link>
                }
              <Link href="/about">
                <p className="text-base font-medium hover:text-gray-200">About</p>
              </Link>
              <Link href="/features">
                <p className="text-base font-medium hover:text-gray-200">Features</p>
              </Link>
              {token ? (
                <button
                  onClick={handleSignOut}
                  className="text-base font-medium hover:text-gray-200 focus:outline-none"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link href="/register">
                    <p className="text-base font-medium hover:text-gray-200">Sign Up</p>
                  </Link>
                  <Link href="/login">
                    <p className="text-base font-medium hover:text-gray-200">Log In</p>
                  </Link>
                </>
              )}
            </div>
  
            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-gray-200 focus:outline-none"
                aria-label="Toggle Menu"
              >
                {/* Icon for menu */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
  
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 text-white">
                {token && 
                <Link href="/dashboard">
                    <p className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                    Dashboard
                    </p>
                </Link>
                }
              <Link href="/about">
                <p className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  About
                </p>
              </Link>
              <Link href="/features">
                <p className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  Features
                </p>
              </Link>
              {token ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 focus:outline-none"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link href="/register">
                    <p className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                      Sign Up
                    </p>
                  </Link>
                  <Link href="/login">
                    <p className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                      Log In
                    </p>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    )
}