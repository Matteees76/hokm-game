import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <main className="howToPlayPage">

      <div className="howToPlayHeader">
        <Link
          href="/"
          className="backButton"
        >
          ← Back
        </Link>

        <div>
          <h1>How to Play Hokm</h1>

          <p>
            Learn the rules, turn order,
            Hokm system, scoring and strategy.
          </p>
        </div>
      </div>


      <div className="rulesContainer">

        <section className="rulesSection">
          <span className="sectionNumber">
            01
          </span>

          <h2>Objective</h2>

          <p>
            Hokm is a four-player trick-taking
            card game played in two teams.
          </p>

          <p>
            You and the player opposite you are
            teammates. The two players on the
            other side form the opposing team.
          </p>

          <div className="teamExample">
            <div>
              <strong>Your Team</strong>

              <span>
                You + Player 3
              </span>
            </div>

            <div>
              <strong>Opponents</strong>

              <span>
                Player 2 + Player 4
              </span>
            </div>
          </div>

          <p>
            The goal of each hand is to be the
            first team to win 7 tricks.
          </p>

          <p>
            The first team to win 7 hands wins
            the full match.
          </p>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            02
          </span>

          <h2>The Hâkem</h2>

          <p>
            One player is chosen as the Hâkem.
            The Hâkem has an important role
            because they choose the Hokm suit.
          </p>

          <p>
            At the start of a hand, the Hâkem
            receives the first 5 cards.
          </p>

          <p>
            After seeing those cards, the Hâkem
            chooses one of the four suits:
          </p>

          <div className="suitRow">
            <div className="suitRule blackSuitRule">
              ♠
              <span>Spades</span>
            </div>

            <div className="suitRule redSuitRule">
              ♥
              <span>Hearts</span>
            </div>

            <div className="suitRule blackSuitRule">
              ♣
              <span>Clubs</span>
            </div>

            <div className="suitRule redSuitRule">
              ♦
              <span>Diamonds</span>
            </div>
          </div>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            03
          </span>

          <h2>What is Hokm?</h2>

          <p>
            The suit chosen by the Hâkem becomes
            the Hokm, also known as the trump suit.
          </p>

          <p>
            Hokm cards are stronger than cards
            from every other suit.
          </p>

          <div className="ruleExample">
            <div className="exampleTitle">
              Example
            </div>

            <p>
              If Clubs are Hokm:
            </p>

           <div className="exampleCards">
  <span className="redExampleCard">A♥</span>
  <span className="redExampleCard">K♥</span>

  <span className="winningExample">
    2♣
  </span>

  <span className="redExampleCard">Q♥</span>
</div>

            <p>
              Even though 2♣ is a low card,
              it wins because Clubs are Hokm.
            </p>
          </div>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            04
          </span>

          <h2>Card Ranking</h2>

          <p>
            Cards rank from highest to lowest:
          </p>

          <div className="rankRow">
            <span>A</span>
            <span>K</span>
            <span>Q</span>
            <span>J</span>
            <span>10</span>
            <span>9</span>
            <span>8</span>
            <span>7</span>
            <span>6</span>
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
          </div>

          <p>
            Ace is the highest card and 2 is the
            lowest card.
          </p>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            05
          </span>

          <h2>Playing a Trick</h2>

          <p>
            A trick consists of one card played
            by each of the four players.
          </p>

          <p>
            The first player leads by playing
            any card from their hand.
          </p>

          <p>
            Play then continues around the table
            until all four players have played.
          </p>

          <div className="turnOrderExample">
            <span>You</span>
            <span>→</span>
            <span>Player 2</span>
            <span>→</span>
            <span>Player 3</span>
            <span>→</span>
            <span>Player 4</span>
          </div>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            06
          </span>

          <h2>Following Suit</h2>

          <p>
            You must follow the suit of the first
            card played if you have a card of
            that suit.
          </p>

          <div className="ruleExample">
            <div className="exampleTitle">
              Example
            </div>

            <p>
              Player 2 leads with:
            </p>

           <div className="singleExampleCard redExampleCard">
  8♥
</div>

            <p>
              If you have any Hearts, you must
              play a Heart.
            </p>
          </div>

          <p>
            If you do not have any cards of the
            led suit, you may play any card.
          </p>

          <p>
            This includes playing a Hokm card to
            trump the trick.
          </p>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            07
          </span>

          <h2>Winning a Trick</h2>

          <p>
            If no Hokm card is played, the
            highest card of the led suit wins.
          </p>

          <p>
            If one or more Hokm cards are played,
            the highest Hokm card wins.
          </p>

          <div className="ruleExample">
            <div className="exampleTitle">
              Example
            </div>

            <p>
              Hearts are led and Clubs are Hokm:
            </p>

            <div className="exampleCards">
  <span className="redExampleCard">A♥</span>
  <span className="redExampleCard">K♥</span>

  <span className="winningExample">
    5♣
  </span>

  <span className="redExampleCard">Q♥</span>
</div>

            <p>
              5♣ wins because a Hokm card beats
              every non-Hokm card.
            </p>
          </div>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            08
          </span>

          <h2>Who Leads Next?</h2>

          <p>
            Whoever wins the trick becomes the
            leader of the next trick.
          </p>

          <p>
            That player may lead with any card
            they choose.
          </p>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            09
          </span>

          <h2>Winning a Hand</h2>

          <p>
            Each trick your team wins adds one
            point to your current trick score.
          </p>

          <p>
            The first team to reach 7 tricks wins
            the hand.
          </p>

          <div className="scoreExample">
            <div>
              <span>Your Team</span>
              <strong>7</strong>
            </div>

            <div>
              <span>Opponents</span>
              <strong>4</strong>
            </div>
          </div>
        </section>


        <section className="rulesSection">
          <span className="sectionNumber">
            10
          </span>

          <h2>Winning the Match</h2>

          <p>
            Winning a hand adds one win to your
            team's overall match score.
          </p>

          <p>
            The first team to reach 7 hand wins
            wins the full match.
          </p>

          <div className="matchExample">
            <span>Final Score</span>

            <strong>
              7 - 3
            </strong>
          </div>
        </section>


        <section className="rulesSection strategySection">
          <span className="sectionNumber">
            11
          </span>

          <h2>Basic Strategy</h2>

          <p>
            Hokm is not only about playing your
            highest cards. Good players also
            think about their teammate.
          </p>

          <div className="strategyGrid">

            <div>
              <strong>
                Don't waste high cards
              </strong>

              <p>
                If your teammate is already
                winning the trick, avoid using a
                stronger card unnecessarily.
              </p>
            </div>

            <div>
              <strong>
                Save your Hokm
              </strong>

              <p>
                Trump cards are powerful. Try not
                to waste them when your team is
                already winning.
              </p>
            </div>

            <div>
              <strong>
                Watch missing suits
              </strong>

              <p>
                If a player cannot follow a suit,
                remember that they are likely
                out of that suit.
              </p>
            </div>

            <div>
              <strong>
                Play as a team
              </strong>

              <p>
                Your goal is for your team to win
                the trick, not necessarily for
                you personally to win it.
              </p>
            </div>

          </div>
        </section>

      </div>

    </main>
  );
}