import { useState, useEffect } from 'react';
import { useChores } from '../context/ChoreContext';

const AddChoreForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addChore } = useChores();
  const [choreData, setChoreData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    completed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle closing modal with escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // prevent bg scrolling
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChoreData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // basic validation
    if (!choreData.title.trim()) {
      alert('Please enter a chore title');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // add timestamp and save
      await addChore({
        ...choreData,
        createdAt: new Date().toISOString(),
      });

      // reset form
      setChoreData({
        title: '',
        description: '',
        assignedTo: '',
        completed: false,
      });

      setIsOpen(false);
    } catch (err) {
      console.error('Error adding chore:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-chore-container">
      <button 
        className="add-chore-button"
        onClick={() => setIsOpen(true)}
      >
        + Add New Chore
      </button>
      
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setIsOpen(false)}></div>
          <div className="modal-content">
            <h2>Add New Chore</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Chore Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={choreData.title}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={choreData.description}
                  onChange={handleChange}
                  placeholder="Add more details if needed"
                  rows="2"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="assignedTo">Assigned To (Optional)</label>
                <input
                  type="text"
                  id="assignedTo"
                  name="assignedTo"
                  value={choreData.assignedTo}
                  onChange={handleChange}
                  placeholder="Who should do this chore?"
                />
              </div>
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Chore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddChoreForm;