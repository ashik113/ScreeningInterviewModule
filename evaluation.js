function evaluateResponse(userResponse, correctAnswer) {
    // Split the user's response into words
    const userWords = userResponse.toLowerCase().split(/\s+/);
    
    // Split the correct answer into words
    const correctWords = correctAnswer.toLowerCase().split(/\s+/);
    
    // Calculate the proportion of matched words
    const matchCount = correctWords.filter(correctWord => userWords.includes(correctWord)).length;
    const totalWords = Math.max(userWords.length, correctWords.length); // Use the longer list as the denominator
    const matchProportion = matchCount / totalWords;
    
    // Map the match proportion to a rank between 1 and 10
    const minRank = 1;
    const maxRank = 10;
    const rank = Math.round((maxRank - minRank) * matchProportion) + minRank;
    
    return rank;
}




module.exports = evaluateResponse;
