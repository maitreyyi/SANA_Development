import React from "react";
import { Link } from "react-router-dom";

const Home = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b whit">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to the SANA Web Interface
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The most powerful network alignment algorithm, delivering unmatched speed and accuracy in finding the best possible mapping between network nodes.
          </p>
          

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/submit-job">
              <button className="px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-lg transition-colors">
                Submit New Job
              </button>
            </Link>
            <Link to="/lookup-job">
              <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-lg border border-gray-200 transition-colors">
                Look up Previous Job
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-lg border border-gray-200 transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>

 
        <div className="mb-16 rounded-xl overflow-hidden shadow-lg bg-white p-4">
          <img
            src="network-alignment.gif"
            alt="Network alignment visualization"
            className="w-full max-w-3xl mx-auto rounded-lg"
          />
        </div>


        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold mb-6">About SANA</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
              SANA stands for Simulated Annealing Network Aligner. It takes as input two networks and aligns them (schematically).{" "}
                <span className="font-semibold text-primary">
                  SANA is by far the best global network alignment algorithm out there,
                  and will probably never be beaten because (a) it's fast, and (b) it
                  produces the best answer possible in cases where we know the correct
                  answer.
                </span>
              </p>
              <p className="text-gray-700">
              We have compared it against <i>every</i> algorithm we've found in the
              past decade, and SANA outperforms them all, often by a <i>huge</i>{" "}
              margin. It may sound like pure chutzpah to say so, but we firmly believe
              that if you're using anything other than SANA to align your networks,
              then you're wasting your time. I challenge anybody to disprove this
              statement.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="https://doi.org/10.1093/bioinformatics/btx090"
              className="block p-6 bg-white rounded-lg hover:shadow-md transition-shadow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 className="font-semibold mb-2">Research Paper</h3>
              <p className="text-gray-600">
              This version corresponds to our first paper, published in Bioinformatics. You can also view the{" "}
              <a 
                href="https://arxiv.org/abs/1607.02642"
                className="underline hover:text-blue-600 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                preprint
              </a>.
              </p>
            </a>
            <a 
              href="https://github.com/waynebhayes/SANA"
              className="block p-6 bg-white rounded-lg hover:shadow-md transition-shadow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 className="font-semibold mb-2">GitHub Repository</h3>
              <p className="text-gray-600">The most recent version of SANA is always available on github.</p>
            </a>
            <a 
             href="SANA+IID.tar.gz"
              className="block p-6 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-2">IID Networks</h3>
              <p className="text-gray-600">The full IID networks used in the paper not available yet are available here.</p>
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <img
            width="400"
            className="mx-auto rounded-lg"
            src="xkcd-machine-learning.png"
            alt="Network alignment cartoon"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;