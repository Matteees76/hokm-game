"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="home">

      <div className="menuDecoration menuDecorationLeft">
        <div className="decorCard decorCardBack">
          ♠
        </div>

        <div className="decorCard decorCardFront">
          ♥
        </div>
      </div>


      <div className="menuDecoration menuDecorationRight">
        <div className="decorCard decorCardBack">
          ♣
        </div>

        <div className="decorCard decorCardFront">
          ♦
        </div>
      </div>


      <div className="logoArea">

        <div className="logoSuits">
          <span className="blackSuit">♠</span>
          <span className="redSuit">♥</span>
          <span className="blackSuit">♣</span>
          <span className="redSuit">♦</span>
        </div>

        <h1>HOKM</h1>

        <p>The Persian Card Game</p>

      </div>


      <div className="mainMenuPanel">

        <button
          className="menuButton featured"
          onClick={() =>
            router.push("/game")
          }
        >
          <div className="menuButtonText">
            <strong>
              Play vs Bots
            </strong>

            <span>
              Start a single-player match
            </span>
          </div>

          <span className="menuArrow">
            ›
          </span>
        </button>


        <button
          className="menuButton"
          onClick={() =>
            router.push("/online")
          }
        >
          <div className="menuButtonText">
            <strong>
              Online
            </strong>

            <span>
              Play against other players
            </span>
          </div>

          <span className="menuArrow">
            ›
          </span>
        </button>


        <button
          className="menuButton"
          onClick={() =>
            router.push("/private-game")
          }
        >
          <div className="menuButtonText">
            <strong>
              Private Game
            </strong>

            <span>
              Play with friends
            </span>
          </div>

          <span className="menuArrow">
            ›
          </span>
        </button>


        <button
          className="menuButton"
          onClick={() =>
            router.push("/how-to-play")
          }
        >
          <div className="menuButtonText">
            <strong>
              How to Play
            </strong>

            <span>
              Learn the rules of Hokm
            </span>
          </div>

          <span className="menuArrow">
            ›
          </span>
        </button>

      </div>


      <section className="homeSeoSection">

        <h2>
          Play Hokm Online
        </h2>

        <p>
          Classic Hokm lets you play the traditional
          Persian card game Hokm directly in your
          browser. Play against bots, join an online
          game with other players, or create a private
          game to play with friends.
        </p>

        <p>
          Hokm is a four-player trick-taking card game
          played in two teams. One player becomes the
          Hâkem and chooses the Hokm, or trump suit,
          before players compete to win tricks and
          hands.
        </p>

        <p>
          New to the game? Read our{" "}
          <Link href="/how-to-play">
            complete guide to how to play Hokm
          </Link>{" "}
          to learn the rules, card ranking, trump
          system, scoring and basic strategy.
        </p>

      </section>

    </main>
  );
}