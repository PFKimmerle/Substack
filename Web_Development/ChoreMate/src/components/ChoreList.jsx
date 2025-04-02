import React, { useState, useEffect } from 'react';
import ChoreItem from './ChoreItem';
import { useChores } from '../context/ChoreContext';

const ChoreList = ({ triggerSuggestions }) => {
  const { chores, loading, error, addChore } = useChores();
  
  // split into done/not done
  const pendingChores = chores.filter(chore => !chore.completed);
  const completedChores = chores.filter(chore => chore.completed);
  
  // State to manage API suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [apiStatus, setApiStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  // word lists for generating chores
  const choreVerbs = ['Clean', 'Organize', 'Tidy', 'Wash', 'Scrub', 'Vacuum', 'Dust', 'Wipe', 'Polish', 'Sweep', 'Mop', 'Declutter'];
  const houseAreas = [
    'kitchen', 'bathroom', 'living room', 'bedroom', 'office', 'closet', 'pantry', 
    'garage', 'basement', 'attic', 'patio', 'yard', 'windows', 'floors', 'walls', 
    'countertops', 'furniture', 'shelves', 'refrigerator', 'oven', 'microwave', 
    'cabinets', 'drawers', 'shower', 'bathtub', 'toilet', 'sink'
  ];

  // get chore ideas from APIs
  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    setApiStatus('loading');
    setSuggestions([]); // Clear previous suggestions
    
    try {
      const newSuggestions = [];
      
      // try 3 APIs at once for speed
      const fetchPromises = [
        fetchCatFact(),
        fetchRandomDogFact(),
        fetchBoredActivity()
      ];
      
      // Wait for all requests to complete
      const results = await Promise.allSettled(fetchPromises);
      
      // Use what worked from the promises
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          newSuggestions.push(result.value);
        }
      });
      
      if (newSuggestions.length > 0) {
        // need 3 total - fill in blanks with fallbacks
        while (newSuggestions.length < 3) {
          const fallback = generateFallbackChore();
          newSuggestions.push(fallback);
        }
        
        setSuggestions(newSuggestions);
        setApiStatus('success');
        console.log('SUCCESS: Generated API suggestions:', newSuggestions);
      } else {
        throw new Error('All API calls failed');
      }
    } catch (error) {
      console.error('ERROR: Failed to get suggestions from API:', error);
      setApiStatus('error');
      
      // plan B - use hardcoded fallbacks
      const fallbackSuggestions = Array(3).fill().map(() => generateFallbackChore());
      setSuggestions(fallbackSuggestions);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // cat facts -> chores
  const fetchCatFact = async () => {
    try {
      // avoid caching
      const timestamp = Date.now();
      const response = await fetch(`https://catfact.ninja/fact?timestamp=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`Cat Facts API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CAT FACT API SUCCESS:', data);
      
      return transformFactToChore(data.fact, "Cat Fact API");
    } catch (error) {
      console.error('CAT FACT API ERROR:', error);
      return null;
    }
  };

  // random facts -> chores
  const fetchRandomDogFact = async () => {
    try {
      //dog fact API is unreliable, using this instead
      const timestamp = Date.now();
      const response = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random?timestamp=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`Random Facts API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('RANDOM FACT API SUCCESS:', data);
      
      return transformFactToChore(data.text, "Random Facts API");
    } catch (error) {
      console.error('RANDOM FACT API ERROR:', error);
      return null;
    }
  };

  // bored activity -> chores  
  const fetchBoredActivity = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`https://www.boredapi.com/api/activity?timestamp=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`Bored API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('BORED API SUCCESS:', data);
      
      // make random chore
      const choreVerb = choreVerbs[Math.floor(Math.random() * choreVerbs.length)];
      const houseArea = houseAreas[Math.floor(Math.random() * houseAreas.length)];
      
      return {
        title: `${choreVerb} the ${houseArea}`,
        source: 'api',
        apiSource: "Bored API"
      };
    } catch (error) {
      console.error('BORED API ERROR:', error);
      return null;
    }
  };

  // convert facts into chores
  const transformFactToChore = (fact, apiSource) => {
    // pick random area
    const houseArea = houseAreas[Math.floor(Math.random() * houseAreas.length)];
    
    // default verb
    let choreVerb = 'Clean';

    // match action to area
    if (['closet', 'pantry', 'drawers', 'garage', 'office'].includes(houseArea)) {
      choreVerb = 'Organize';
    } else if (['carpet', 'floors'].includes(houseArea)) {
      choreVerb = 'Vacuum';
    } else if (['counters', 'windows'].includes(houseArea)) {
      choreVerb = 'Wipe';
    } else if (['furniture', 'shelves'].includes(houseArea)) {
      choreVerb = 'Dust';
    }

    // create a chore title
    const title = `${choreVerb} the ${houseArea}`;
    
    return {
      title,
      source: 'api',
      apiSource
    };
  };
  
  // Fallback chore if APIs fail
  const generateFallbackChore = () => {
    const fallbackChores = [
      { title: 'Clean the bathroom' },
      { title: 'Organize the pantry' },
      { title: 'Vacuum the carpet' },
      { title: 'Dust the furniture' },
      { title: 'Mop the floors' },
      { title: 'Declutter the closet' },
      { title: 'Clean the kitchen' },
      { title: 'Wash the windows' },
      { title: 'Clean the refrigerator' },
      { title: 'Wipe kitchen counters' },
      { title: 'Sweep the patio' },
      { title: 'Organize the garage' }
    ];
    
    const randomChore = fallbackChores[Math.floor(Math.random() * fallbackChores.length)];
    
    return {
      ...randomChore,
      source: 'fallback'
    };
  };

  // Add suggestion to chore list
  const handleAddSuggestion = (suggestion) => {
    addChore({
      title: suggestion.title,
      description: '',
      assignedTo: '',
      completed: false,
      createdAt: new Date().toISOString()
    });
  };

  // make sure APIs work on startup
  useEffect(() => {
      // quick API check
    const testApis = async () => {
      try {
        // Test Cat Facts API
        const catResponse = await fetch('https://catfact.ninja/fact');
        if (catResponse.ok) {
          const data = await catResponse.json();
          console.log('CAT FACT API TEST SUCCESS:', data);
        } else {
          console.error('CAT FACT API TEST FAILED: Status', catResponse.status);
        }
        
        // Test Random Facts API
        const randomFactResponse = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
        if (randomFactResponse.ok) {
          const data = await randomFactResponse.json();
          console.log('RANDOM FACT API TEST SUCCESS:', data);
        } else {
          console.error('RANDOM FACT API TEST FAILED: Status', randomFactResponse.status);
        }
        
        // Test Bored API
        const boredResponse = await fetch('https://www.boredapi.com/api/activity');
        if (boredResponse.ok) {
          const data = await boredResponse.json();
          console.log('BORED API TEST SUCCESS:', data);
        } else {
          console.error('BORED API TEST FAILED: Status', boredResponse.status);
        }
      } catch (error) {
        console.error('API TESTS ERROR:', error);
      }
    };
    
    testApis();
  }, []);

  // get suggestions when button clicked
  useEffect(() => {
    if (triggerSuggestions !== undefined) {
      console.log('Suggest Chores button clicked, generating new suggestions');
      generateSuggestions();
    }
  }, [triggerSuggestions]);

  return (
    <div className="chore-list">
      {/* suggestions */}
      {showSuggestions && (
        <div className="suggested-chores">
          <h2>
            Suggested Chores 
            {apiStatus === 'loading' && <span> (Loading...)</span>}
            {apiStatus === 'error' && <span> (API Error - Using Fallbacks)</span>}
          </h2>
          
          {loadingSuggestions ? (
            <div className="loading-suggestions">Generating suggestions...</div>
          ) : (
            <div className="suggested-chores-container">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                >
                  <h3>
                    <span 
                      className="add-suggestion-btn" 
                      onClick={() => handleAddSuggestion(suggestion)}
                      style={{ 
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: '#646cff',
                        color: 'white',
                        textAlign: 'center',
                        lineHeight: '22px',
                        fontWeight: 'bold',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </span>
                    {suggestion.title}
                  </h3>
                  
                  {/* Source badge */}
                  <div 
                    className={suggestion.source === 'api' ? 'source-badge api-badge' : 'source-badge fallback-badge'}
                  >
                    {suggestion.source === 'api' ? 'API GENERATED' : 'FALLBACK'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Chores Section */}
      <div className="pending-chores">
        <h2>Pending Chores</h2>
        {loading ? (
          <div className="loading">Loading chores...</div>
        ) : error ? (
          <div className="error">Error loading chores: {error}</div>
        ) : pendingChores.length === 0 ? (
          <div className="empty-list">No pending chores. Add some!</div>
        ) : (
          <div className="chore-items-container">
            {pendingChores.map(chore => (
              <ChoreItem key={chore.id} chore={chore} />
            ))}
          </div>
        )}
      </div>
      
      {/* Completed List */}
      {completedChores.length > 0 && (
        <div className="completed-chores">
          <h2 className="completed-heading">Completed Chores</h2>
          <div className="chore-items-container">
            {completedChores.map(chore => (
              <ChoreItem key={chore.id} chore={chore} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoreList;