import { useState } from 'react';
import { useChores } from '../context/ChoreContext';

const ChoreItem = ({ chore }) => {
  const { toggleCompletion, deleteChore } = useChores();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    try {
      await toggleCompletion(chore.id, !chore.completed);
    } catch (err) {
      console.error('Error toggling chore:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this chore?')) {
      setIsDeleting(true);
      try {
        await deleteChore(chore.id);
      } catch (err) {
        console.error('Error deleting chore:', err);
        setIsDeleting(false);
      }
    }
  };

  // make date look nicer
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // show deleting status
  if (isDeleting) {
    return <div className="chore-item-row deleting">Deleting...</div>;
  }

  return (
    <div className={`chore-item-row ${chore.completed ? 'completed' : ''}`}>
      <div className="chore-checkbox">
        <input 
          type="checkbox" 
          checked={chore.completed || false} 
          onChange={handleToggle}
        />
      </div>
      <div className="chore-content">
        <div className="chore-title">{chore.title}</div>
        {chore.assignedTo && <span className="chore-assigned">For: {chore.assignedTo}</span>}
        <span className="chore-date">Added: {formatDate(chore.createdAt)}</span>
      </div>
      <div className="chore-actions">
        <button className="delete-btn" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ChoreItem;