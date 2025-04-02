import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import ChoreList from './components/ChoreList'
import AddChoreForm from './components/AddChoreForm'
import { ChoreProvider } from './context/ChoreContext'

function App() {
  // state for suggestion refresh
  const [triggerSuggestions, setTriggerSuggestions] = useState(false);

// flip the suggestion trigger
  const handleSuggestChores = () => {
    setTriggerSuggestions(prev => !prev);
  };

  return (
    <ChoreProvider>
      <div className="app-container">
        <Header />
        
        <div className="app-actions">
          <AddChoreForm />
          
          <button 
            className="suggest-chores-button" 
            onClick={handleSuggestChores}
          >
            Suggest Chores
          </button>
        </div>
        
        <ChoreList 
          triggerSuggestions={triggerSuggestions} 
        />
      </div>
    </ChoreProvider>
  )
}

export default App