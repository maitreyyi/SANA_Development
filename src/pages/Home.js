// src/components/Home.js
import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";

const Home = () => {
  return (
    <div className="flex flex-col justify-center gap-8 text-lg text-left py-8">
      <h1 className="text-5xl font-bold text-center">
        Welcome to the SANA Web Interface
      </h1>
      <img
        src="network-alignment.gif"
        alt="network alignment gif"
        width="800px"
        className="mx-auto"
      />
      
      <p>
        SANA stands for Simulated Annealing Network Aligner. It takes as input
        two networks and aligns them (schematically).{" "}
        <b>
          SANA is by far the best global network alignment algorithm out there,
          and will probably never be beaten because (a) it's fast, and (b) it
          produces the best answer possible in cases where we know the correct
          answer.
        </b>{" "}
        We have compared it against <i>every</i> algorithm we've found in the
        past decade, and SANA outperforms them all, often by a <i>huge</i>{" "}
        margin. It may sound like pure chutzpah to say so, but we firmly believe
        that if you're using anything other than SANA to align your networks,
        then you're wasting your time. I challenge anybody to disprove this
        statement.
      </p>

      <hr className="border w-full border-black transform scale-x-105" />

      <div className="flex flex-col gap-4">
        <p>
          The one available on this website is a bit old and corresponds to the
          version from our first paper, which you can read at{" "}
          <Link
            className="underline hover:text-hover-link text-primary transition"
            href="https://doi.org/10.1093/bioinformatics/btx090"
          >
            BioInformatics
          </Link>
          , or as a{" "}
          <Link
            className="underline hover:text-hover-link text-primary transition"
            href="https://arxiv.org/abs/1607.02642"
          >
            preprint
          </Link>
          .
        </p>

        <p>
          The most recent version of SANA is always available on{" "}
          <Link
            className="underline hover:text-hover-link text-primary transition"
            href="https://github.com/waynebhayes/SANA"
          >
            GitHub
          </Link>
          .
        </p>
        <p>
          The full IID networks used in the paper are available{" "}
          <Link
            className="underline hover:text-hover-link text-primary transition"
            href="SANA+IID.tar.gz"
          >
            here
          </Link>
          .
        </p>
      </div>

      <hr className="border w-full border-black transform scale-x-105" />

      <img
        width="400px"
        className="mx-auto"
        src="xkcd-machine-learning.png"
        alt="Network alignment cartoon"
      />
    </div>
  );
};

export default Home;
