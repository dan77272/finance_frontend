'use client'

import { useEffect, useState } from "react";
import AddIncomeForm from "./AddIncomeForm";
import AddExpenseForm from "./AddExpenseForm";
import Navbar from "./Navbar";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf'
import html2canvas from "html2canvas";

interface Income {
    id: number;
    source: string;
    amount: number;
    date: string;
}

interface Expense {
    id: number;
    category: string;
    amount: number;
    date: string;
}

export default function Dashboard() {
    Chart.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);
    const [income, setIncome] = useState<Income[]>([]);
    const [expense, setExpense] = useState<Expense[]>([]);
    const [userId, setUserId] = useState<string>('');
    const [isTokenLoaded, setIsTokenLoaded] = useState(false)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [categoryFilter, setCategoryFilter] = useState<string>('')
    const [incomeSearch, setIncomeSearch] = useState<string>('')
    const [expenseSearch, setExpenseSearch] = useState<string>('')

    const [emailReportFrequency, setEmailReportFrequency] = useState<string>('weekly')
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)

    const threshold = 500;

    useEffect(() => {
        // Only runs on the client side
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('userId') || '';
            setUserId(storedUserId);
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem('token');
            setIsTokenLoaded(true)

            try {
                const incomeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/income/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!incomeRes.ok) {
                    console.error("Income fetch error:", incomeRes.status, incomeRes.statusText);
                    return;
                }
                const incomeData = await incomeRes.json();
                setIncome(incomeData);

                const expenseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expense/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(expenseRes)
                if (!expenseRes.ok) {
                    console.error("Expense fetch error:", expenseRes.status, expenseRes.statusText);
                    return;
                }
                const expenseData = await expenseRes.json();
                setExpense(expenseData);
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }

        if (userId) {
            fetchData();
        }
    }, [userId]);

    const filteredIncome = income.filter(item => {
        const itemDate = new Date(item.date)
        const matchesDateRange = (!startDate || itemDate >= new Date(startDate)) && (!endDate || itemDate <= new Date(endDate))
        const matchesSearch = item.source.toLowerCase().includes(incomeSearch.toLowerCase())
        return matchesDateRange && matchesSearch
    })

    const filteredExpenses = expense.filter(item => {
        const itemDate = new Date(item.date);
        const matchesDateRange = (!startDate || itemDate >= new Date(startDate)) &&
                                 (!endDate || itemDate <= new Date(endDate));
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesSearch = item.category.toLowerCase().includes(expenseSearch.toLowerCase());
        return matchesDateRange && matchesCategory && matchesSearch;
    });

    const totalIncome = filteredIncome.reduce((acc, item) => acc + item.amount, 0)
    const totalExpenses = filteredExpenses.reduce((acc, item) => acc + item.amount, 0)
    const balance = totalIncome - totalExpenses

    const monthlyIncome = new Array(12).fill(0)
    const monthlyExpenses = new Array(12).fill(0)

    filteredIncome.forEach(item => {
        const month = new Date(item.date).getMonth()
        monthlyIncome[month] += item.amount
    })

    filteredExpenses.forEach(item => {
        const month = new Date(item.date).getMonth()
        monthlyExpenses[month] += item.amount
    })

    const maxIncomeMonth = monthlyIncome.indexOf(Math.max(...monthlyIncome))
    const maxExpenseMonth = monthlyExpenses.indexOf(Math.max(...monthlyExpenses))
    const minIncomeMonth = monthlyIncome.indexOf(Math.min(...monthlyIncome))
    const minExpenseMonth = monthlyExpenses.indexOf(Math.min(...monthlyExpenses))
    

    const monthlyData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
            {
                label: 'Income',
                data: filteredIncome.reduce((acc, item) => {
                    const month = new Date(item.date).getMonth()
                    acc[month] += item.amount
                    return acc
                }, new Array(12).fill(0)),
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            },
            {
                label: 'Expenses',
                data: filteredExpenses.reduce((acc, item) => {
                    const month = new Date(item.date).getMonth()
                    acc[month] += item.amount
                    return acc
                }, new Array(12).fill(0)),
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
        ]
    }

    const categoryTotals = filteredExpenses.reduce((acc: {[key: string]: number}, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount
        return acc
    }, {})

    const topCategories = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a).slice(0, 3).map(([category, amount]) => ({category, amount}))

    const categoryChartData = {
        labels: Object.keys(categoryTotals),
        datasets: [
            {
                label: 'Expenses by Category',
                data: Object.values(categoryTotals),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }
        ]
    }

    function exportToCSV(){
        const rows = [
            ['Source', 'Amount', 'Date', 'Type'],
            ...filteredIncome.map(item => [item.source, item.amount, item.date, 'Income']),
            ...filteredExpenses.map(item => [item.category, item.amount, item.date, 'Expense']), 
        ]

        let csvContent = 'data:text/csv;charset=utf-8'
        rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        })

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', 'income_expense_report.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    async function generatePDF(){
        const pdf = new jsPDF('p', 'pt', 'a4')
        const element = document.getElementById('report-content')

        if(element){
            const canvas = await html2canvas(element)
            const imgData = canvas.toDataURL('image/png')
            const imgWidth = 500
            const pageHeight = pdf.internal.pageSize.height
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            while(heightLeft >= 0){
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            pdf.save('income_expense_report.pdf')
        }
    }

    async function handleSubscribe(){
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({frequency: emailReportFrequency, userId})
        })

        if(response.ok){
            setIsSubscribed(true)
            alert("You are now subscribed to email reports!")
        }else{
            alert("Subscription failed.")
        }
    }

    
    return (
        !isTokenLoaded ? (<div>Loading</div>) : (
        <div>
            <Navbar/>
            <div>
                <div className="p-10 flex gap-10">
                    <button onClick={exportToCSV} className=" bg-green-600 px-3 py-1 rounded-md text-white hover:bg-green-700">Download CSV</button>
                    <button onClick={generatePDF} className=" bg-red-600 px-3 py-1 rounded-md text-white hover:bg-red-700">Download PDF</button>
                </div>
            </div>
            <hr></hr>
            <div className="flex flex-col">
                <div className="p-10 flex flex-col lg:flex-row gap-20 mb-10">
                    <div className="flex-1 flex flex-col gap-6">
                        <h2 className="text-2xl md:text-3xl font-semibold">Add Income</h2>
                        <AddIncomeForm />
                    </div>
                    <div className="flex-1 flex flex-col gap-6">
                        <h2 className="text-2xl md:text-3xl font-semibold">Add Expense</h2>
                        <AddExpenseForm />
                    </div>
                </div>
                <hr></hr>
                <div id="report-content">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10">
                        <div className="flex flex-col gap-4">
                            <p className="text-2xl md:text-3xl font-semibold text-green-500">Income</p>
                            <ul className="list-disc list-inside flex flex-col gap-2">
                            {income.map((item) => (
                                <li key={item.id}>
                                <span className="font-semibold">{item.source}:</span> ${item.amount}
                                </li>
                            ))}
                            </ul>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="text-2xl md:text-3xl font-semibold text-red-500">Expense</p>
                            <ul className="list-disc list-inside flex flex-col gap-2">
                            {expense.map((item) => (
                                <li key={item.id}>
                                <span className="font-semibold">{item.category}:</span> ${item.amount}
                                </li>
                            ))}
                            </ul>
                        </div>
                    </div>
                    <hr></hr>
                    <div className="p-10 flex flex-col space-y-6">
                        <h2 className="text-2xl md:text-3xl font-semibold">Summary</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <dt className="font-semibold text-green-600">Total Income:</dt>
                                <dd>${totalIncome.toFixed(2)}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-red-600">Total Expenses:</dt>
                                <dd>${totalExpenses.toFixed(2)}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold">Balance:</dt>
                                <dd className={`${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${balance.toFixed(2)}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold">Highest Income Month:</dt>
                                <dd>
                                    {new Date(0, maxIncomeMonth).toLocaleString('default', { month: 'long' })}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold">Lowest Income Month:</dt>
                                <dd>
                                    {new Date(0, minIncomeMonth).toLocaleString('default', { month: 'long' })}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold">Highest Expense Month:</dt>
                                <dd>
                                    {new Date(0, maxExpenseMonth).toLocaleString('default', { month: 'long' })}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold">Lowest Expense Month:</dt>
                                <dd>
                                    {new Date(0, minExpenseMonth).toLocaleString('default', { month: 'long' })}
                                </dd>
                            </div>
                        </dl>
                        </div>
                    <hr></hr>
                    <div className="p-10 flex flex-col space-y-6">
                        <h2 className="text-2xl md:text-3xl font-semibold">Top Spending Categories</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topCategories.map((item, index) => (
                            <li
                                key={index}
                                className={`flex justify-between items-center p-2 rounded ${
                                item.amount > threshold ? 'bg-red-100' : 'bg-green-100'
                                }`}
                            >
                                <span className="font-semibold">{item.category}:</span>
                                <span>${item.amount.toFixed(2)}</span>
                            </li>
                            ))}
                        </ul>
                        </div>
                    <hr></hr>
                    <div className="p-10 space-y-16">
                            {/* Income vs Expenses Chart */}
                            <div className="space-y-6">
                                <h2 className="text-2xl md:text-3xl font-bold text-center">
                                Income vs Expenses (Monthly)
                                </h2>
                                <div className="max-w-4xl mx-auto">
                                <Bar
                                    data={monthlyData}
                                    options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' },
                                        title: {
                                        display: false,
                                        },
                                    },
                                    }}
                                />
                                </div>
                            </div>
                            {/* Expenses by Category Chart */}
                            <div className="space-y-6">
                                <h2 className="text-2xl md:text-3xl font-bold text-center">
                                Expenses by Category
                                </h2>
                                <div className="max-w-md mx-auto">
                                <Doughnut
                                    data={categoryChartData}
                                    options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' },
                                        title: {
                                        display: false,
                                        },
                                    },
                                    }}
                                />
                                </div>
                            </div>
                            </div>
                <hr></hr>
                <form className="p-10 space-y-8">
                    {/* Date Range Filter */}
                    <fieldset className="border border-gray-200 p-4 rounded-md">
                        <legend className="text-lg font-medium px-2">Date Range</legend>
                        <div className="flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-6 mt-4">
                        <div className="flex items-center">
                            <label htmlFor="startDate" className="mr-2 font-medium">Start Date:</label>
                            <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="endDate" className="mr-2 font-medium">End Date:</label>
                            <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        </div>
                    </fieldset>

                    {/* Expense Category Filter */}
                    <div className="flex items-center space-x-4">
                        <label htmlFor="categoryFilter" className="font-medium">Expense Category:</label>
                        <select
                        id="categoryFilter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                        <option value="">All</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                        </select>
                    </div>

                    {/* Search Inputs */}
                    <fieldset className="border border-gray-200 p-4 rounded-md">
                        <legend className="text-lg font-medium px-2">Search</legend>
                        <div className="flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-6 mt-4">
                        <div className="flex items-center">
                            <label htmlFor="incomeSearch" className="mr-2 font-medium">Income Search:</label>
                            <input
                            id="incomeSearch"
                            type="text"
                            value={incomeSearch}
                            onChange={(e) => setIncomeSearch(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search Income"
                            />
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="expenseSearch" className="mr-2 font-medium">Expense Search:</label>
                            <input
                            id="expenseSearch"
                            type="text"
                            value={expenseSearch}
                            onChange={(e) => setExpenseSearch(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search Expenses"
                            />
                        </div>
                        </div>
                    </fieldset>
                    </form>
                <hr></hr>
                <div className="p-10">
                    <h2 className="text-2xl font-semibold mb-6">Email Report Subscription</h2>
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                        <div className="flex items-center">
                        <label htmlFor="frequency" className="mr-2 font-medium">
                            Frequency:
                        </label>
                        <select
                            id="frequency"
                            value={emailReportFrequency}
                            onChange={(e) => setEmailReportFrequency(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        </div>
                        <button
                        onClick={handleSubscribe}
                        aria-pressed={isSubscribed}
                        className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                            isSubscribed ? 'bg-green-600 hover:bg-green-700' : ''
                        }`}
                        >
                        {isSubscribed ? 'Subscribed' : 'Subscribe to Reports'}
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        )
    );
}
