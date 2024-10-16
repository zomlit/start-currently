export const createBrackets = (teams, includeLosersBracket) => {
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const rounds = Math.ceil(Math.log2(shuffledTeams.length));
  let winnersBracket = [];
  let losersBracket = [];

  for (let round = 0; round < rounds; round++) {
    let roundMatches = [];
    const matchesInRound = Math.pow(2, rounds - round - 1);

    for (let match = 0; match < matchesInRound; match++) {
      if (round === 0) {
        const team1 = shuffledTeams[match * 2] ? { ...shuffledTeams[match * 2], score: 0 } : null;
        const team2 = shuffledTeams[match * 2 + 1]
          ? { ...shuffledTeams[match * 2 + 1], score: 0 }
          : { name: "BYE", isBye: true, score: 0 };
        const matchObj = { team1, team2, winner: team2.isBye ? team1 : null };
        roundMatches.push(matchObj);
      } else {
        roundMatches.push({ team1: null, team2: null, winner: null });
      }
    }

    winnersBracket.push(roundMatches);
  }

  if (includeLosersBracket) {
    winnersBracket.push([{ team1: null, team2: null, winner: null }]);
  }

  propagateWinners(winnersBracket);

  if (includeLosersBracket) {
    losersBracket = generateLosersBracket(rounds, teams.length);
  }

  return { winnersBracket, losersBracket };
};

export const generateLosersBracket = (rounds, totalTeams) => {
  let losersBracket = [];
  for (let round = 0; round < rounds - 1; round++) {
    let roundMatches = [];
    const matchesInRound = Math.pow(2, rounds - round - 2);

    for (let match = 0; match < matchesInRound; match++) {
      roundMatches.push({ team1: null, team2: null, winner: null });
    }

    losersBracket.push(roundMatches);
  }

  // Add BYE rounds if necessary
  const totalMatches = Math.pow(2, rounds - 1);
  const byesNeeded = totalMatches - totalTeams;
  if (byesNeeded > 0) {
    for (let i = 0; i < byesNeeded; i++) {
      losersBracket[0][i] = {
        team1: { name: "BYE", isBye: true, score: 0 },
        team2: null,
        winner: null,
      };
    }
  }

  // Handle the case where there are only 3 teams in the loser's first round
  if (losersBracket[0].length === 3) {
    losersBracket[0].push({
      team1: { name: "BYE", isBye: true, score: 0 },
      team2: null,
      winner: null,
    });
  }

  return losersBracket;
};

export const propagateWinners = (bracket) => {
  for (let round = 0; round < bracket.length - 1; round++) {
    bracket[round].forEach((match, matchIndex) => {
      if (match.winner && !match.winner.disqualified) {
        const nextRoundMatchIndex = Math.floor(matchIndex / 2);
        const isFirstTeam = matchIndex % 2 === 0;
        const winningTeam = { ...match.winner, score: 0 };
        delete winningTeam.winner;
        bracket[round + 1][nextRoundMatchIndex][isFirstTeam ? "team1" : "team2"] = winningTeam;
      }
    });
  }
};

export const updateWinnersBracket = (bracket, roundIndex, matchIndex, blueScore, orangeScore) => {
  const updatedBracket = [...bracket];
  const match = updatedBracket[roundIndex][matchIndex];

  match.team1.score = blueScore;
  match.team2.score = orangeScore;
  match.winner = blueScore > orangeScore ? match.team1 : match.team2;

  if (roundIndex + 1 < updatedBracket.length) {
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const isFirstTeam = matchIndex % 2 === 0;
    const winningTeam = { ...match.winner, score: 0 };
    delete winningTeam.winner;
    if (!winningTeam.disqualified) {
      updatedBracket[roundIndex + 1][nextMatchIndex][isFirstTeam ? "team1" : "team2"] = winningTeam;
    } else {
      // Handle multiple disqualifications
      const nextAvailableTeam = findNextAvailableTeam(
        updatedBracket,
        roundIndex,
        matchIndex,
        isFirstTeam,
      );
      if (nextAvailableTeam) {
        updatedBracket[roundIndex + 1][nextMatchIndex][isFirstTeam ? "team1" : "team2"] =
          nextAvailableTeam;
      }
    }
  }

  return updatedBracket;
};

export const updateLosersBracket = (
  losersBracket,
  winnersBracket,
  roundIndex,
  matchIndex,
  blueScore,
  orangeScore,
) => {
  const updatedLosersBracket = [...losersBracket];
  const match = updatedLosersBracket[roundIndex][matchIndex];

  match.team1.score = blueScore;
  match.team2.score = orangeScore;
  match.winner = blueScore > orangeScore ? match.team1 : match.team2;

  if (roundIndex + 1 < updatedLosersBracket.length) {
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const isFirstTeam = matchIndex % 2 === 0;
    const winningTeam = { ...match.winner, score: 0 };
    delete winningTeam.winner;
    if (!winningTeam.disqualified) {
      updatedLosersBracket[roundIndex + 1][nextMatchIndex][isFirstTeam ? "team1" : "team2"] =
        winningTeam;
    } else {
      // Handle multiple disqualifications
      const nextAvailableTeam = findNextAvailableTeam(
        updatedLosersBracket,
        roundIndex,
        matchIndex,
        isFirstTeam,
      );
      if (nextAvailableTeam) {
        updatedLosersBracket[roundIndex + 1][nextMatchIndex][isFirstTeam ? "team1" : "team2"] =
          nextAvailableTeam;
      }
    }
  } else {
    // This is the final round of the losers bracket
    const updatedWinnersBracket = [...winnersBracket];
    const grandFinal = updatedWinnersBracket[updatedWinnersBracket.length - 1][0];
    grandFinal.team2 = { ...match.winner, score: 0 };
    return { updatedLosersBracket, updatedWinnersBracket };
  }

  return { updatedLosersBracket, updatedWinnersBracket: winnersBracket };
};

export const findNextAvailableTeam = (bracket, roundIndex, matchIndex, isFirstTeam) => {
  for (let i = matchIndex + 1; i < bracket[roundIndex].length; i++) {
    const nextMatch = bracket[roundIndex][i];
    if (nextMatch.winner && !nextMatch.winner.disqualified) {
      const nextAvailableTeam = { ...nextMatch.winner, score: 0 };
      delete nextAvailableTeam.winner;
      return nextAvailableTeam;
    }
  }
  return null;
};

export const findNextOpenSlotInLosersBracket = (losersBracket, roundIndex) => {
  for (let i = 0; i < losersBracket[roundIndex].length; i++) {
    if (!losersBracket[roundIndex][i].team1) {
      return { matchIndex: i, isFirstTeam: true };
    } else if (!losersBracket[roundIndex][i].team2) {
      return { matchIndex: i, isFirstTeam: false };
    }
  }
  return null;
};
