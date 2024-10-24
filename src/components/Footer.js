import React from 'react';
import {Link} from 'react-router-dom';

function Footer(){
    return (
        <footer className="bg-blue-600 text-white p-4 text-left">
          <p>SANA software</p>
          <p>Written by Nil Mamano under the supervision of Dr. Wayne B. Hayes at U.C. Irvine.</p>
          <hr class="border-t border-gray-300 my-4"></hr>
          <p>SANA Web Interface</p>
          <p>Current Developer: Maitreyi Sinha</p>
          <hr class="border-t border-gray-300 my-4"></hr>
          <p>Please contact the currebt developer above and/or Dr. Wayne B. Hayes for questions, comments, or bugs.</p>
        </footer>
    );
}

export default Footer;

