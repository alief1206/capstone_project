import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<div>Halo, EatSistent! 🥗</div>} />
                
                <Route
                    path="/about"
                    element={
                        <div className='flex justify-center min-h-screen bg-gray-100'>
                            <div className='w-full max-w-md bg-white min-h-screen shadow-xl overflow-hidden relative flex flex-col p-6 text-center'>
                                <h1 className='text-2xl font-bold mt-10 text-green-600 mb-8'>
                                    EatSistent
                                </h1>
                                <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                                    Halo, EatSistent! 
                                </h2>
                                <p className='text-gray-600 text-lg'>
                                    Setup React, Router, dan Tailwind berhasil! Silakan mulai koding.
                                </p>
                            </div>
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;