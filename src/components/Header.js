import React from 'react';
import {Link} from 'react-router-dom';

function Header(){
    return (
        <header className="bg-blue-500 text-white py-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center py-4">
                <Link to = "/" className="text-2xl font-bold">SANA Web Interface</Link>
                <nav className="flex space-x-4">
                    <Link to="/submit-job" className="hover:text-blue-300">Submit Job</Link>
                    <Link to="/lookup-job" className="hover:text-blue-300">Lookup Previous Job</Link>
                    <Link to="/contact" className="hover:text-blue-300">Contact Us</Link>
                </nav>
            </div>
          
        </header>
    );
}

export default Header;