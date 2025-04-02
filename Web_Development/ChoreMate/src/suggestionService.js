import { dictionaryWords, actionWords, areaWords, descriptiveWords } from './suggestionWords';

// Generate random chore suggestions
export const generateChoreIdeas = async (memberCount = 2) => {
  try {
    console.log("Generating chore ideas...");
    
    const chores = [];
    // limit based on household size
    const choreCount = Math.min(5 + Math.floor(memberCount / 2), 8);
    
     // track what we've used already
    const usedCombinations = new Set();
    
    // Generate unique chores based on NLP patterns
    for (let i = 0; i < choreCount; i++) {
      let action, area, descriptor;
      let combination;
      
      // Ensure we don't generate duplicate combinations
      do {
        action = actionWords[Math.floor(Math.random() * actionWords.length)];
        area = areaWords[Math.floor(Math.random() * areaWords.length)];
        descriptor = descriptiveWords[Math.floor(Math.random() * descriptiveWords.length)];
        combination = `${action}-${area}`;
      } while (usedCombinations.has(combination));
      
      usedCombinations.add(combination);
      
      // make it look nice
      const title = `${action.charAt(0).toUpperCase() + action.slice(1)} the ${area}`;
      
      // random descriptions
      const descriptions = [
        `${descriptor} ${action} the ${area} to keep your home looking great.`,
        `A thorough ${action} of the ${area} will make a noticeable difference.`,
        `The ${area} needs ${action}ing to maintain cleanliness and order.`,
        `A quick ${action} of the ${area} will improve your living space.`,
        `${descriptor} ${action} the ${area} for a healthier home environment.`
      ];
      
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Add semantic context based on household size
      let contextualFactor = "";
      if (memberCount > 3 && Math.random() > 0.7) {
        contextualFactor = " This task works well when divided among household members.";
      }
      
      chores.push({
        title,
        description: description + contextualFactor
      });
    }
    
    // we're done!
    console.log(`Generated ${chores.length} chore suggestions`);
    
    return chores;
  } catch (error) {
    console.error("Suggestion Service Error:", error);
    return defaultChores(memberCount);
  }
};

// Default chores as fallback
const defaultChores = (memberCount) => {
  const chores = [
    {
      title: "Vacuum Living Room",
      description: "Vacuum the living room carpet and furniture."
    },
    {
      title: "Clean Kitchen",
      description: "Wipe down counters, clean stove, and mop floor."
    },
    {
      title: "Take Out Trash",
      description: "Collect all trash from bins and take to outdoor container."
    },
    {
      title: "Dust Furniture",
      description: "Dust all furniture surfaces in common areas."
    },
    {
      title: "Clean Bathroom",
      description: "Clean toilet, sink, shower, and mop floor."
    }
  ];

  return chores;
};
