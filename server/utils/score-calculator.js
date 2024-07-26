// function calculateScore(guess, correctWord, timeLeft) {
//     let score = 0;
    
//     if (guess.toLowerCase() === correctWord.toLowerCase()) {
//       // Base score for correct guess
//       score = 100;
      
//       // Bonus points for quicker guesses
//       score += timeLeft * 2;
//     } else {
//       // Partial score for similar guesses could be implemented here
//       // This would require a more complex string similarity algorithm
//     }
    
//     return score;
//   }
  
//   module.exports = { calculateScore };


function calculateScore(roundStartTime) {
  const timeTaken = (Date.now() - roundStartTime) / 1000; // time in seconds
  const maxScore = 100;
  const minScore = 10;
  const maxTime = 60; // maximum round time in seconds

  if (timeTaken >= maxTime) {
    return minScore;
  }

  const score = Math.round(maxScore - ((timeTaken / maxTime) * (maxScore - minScore)));
  return score;
}

module.exports = { calculateScore };