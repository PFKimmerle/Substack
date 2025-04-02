import React, { createContext, useContext, useState, useEffect } from 'react';
import { getChores, addChore as addChoreToDb, updateChore, deleteChore as deleteChoreFromDb } from '../firebase';

// context for chore data
export const ChoreContext = createContext();


export const ChoreProvider = ({ children }) => {
  // state
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load chores on mount
  useEffect(() => {
    const fetchChores = async () => {
      try {
        setLoading(true);
        const choreData = await getChores();
        setChores(choreData);
        setError(null);
      } catch (err) {
        console.error('Error fetching chores:', err);
        setError('Failed to load chores');
      } finally {
        setLoading(false);
      }
    };

    fetchChores();
  }, []);

  // add new chore
  const addChore = async (chore) => {
    try {
      const newChore = await addChoreToDb(chore);
      setChores(prev => [newChore, ...prev]);
      return newChore;
    } catch (err) {
      console.error('Error adding chore:', err);
      throw err;
    }
  };

  // mark as done/not done
  const toggleCompletion = async (id, completed) => {
    try {
      await updateChore(id, { completed });
      setChores(prev => 
        prev.map(chore => 
          chore.id === id ? { ...chore, completed } : chore
        )
      );
    } catch (err) {
      console.error('Error toggling chore:', err);
      throw err;
    }
  };

  // delete a chore
  const deleteChore = async (id) => {
    try {
      await deleteChoreFromDb(id);
      setChores(prev => prev.filter(chore => chore.id !== id));
    } catch (err) {
      console.error('Error deleting chore:', err);
      throw err;
    }
  };

  // stuff to expose to components
  const value = {
    chores,
    loading,
    error,
    addChore,
    toggleCompletion,
    deleteChore
  };

  return (
    <ChoreContext.Provider value={value}>
      {children}
    </ChoreContext.Provider>
  );
};

// helper to use context easier
export const useChores = () => {
  const context = useContext(ChoreContext);
  if (!context) {
    throw new Error('useChores must be used within a ChoreProvider');
  }
  return context;
};