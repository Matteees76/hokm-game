"use client";
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
  onClick={() => router.push("/game")}
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


     

    </main>
  );
}