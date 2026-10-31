import React, { useState } from 'react';

const DynamicForm = () => {
  // Initialize state with one row containing empty title and content
  const [details, setDetails] = useState([{ title: '', content: '' }]);
  const [description, setDescription] = useState('');

  // Handle text changes for specific fields in the array
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedDetails = [...details];
    updatedDetails[index][name] = value;
    setDetails(updatedDetails);
  };

  // Add a new blank title/content row to the state
  const addDetailRow = () => {
    setDetails([...details, { title: '', content: '' }]);
  };

  // Remove a specific row
  const removeDetailRow = (index) => {
    if (details.length > 1) {
      const updatedDetails = details.filter((_, i) => i !== index);
      setDetails(updatedDetails);
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    
    const formData = {
      description,
      details
    };

    console.log('Submitted Data:', formData);
    // Add your API call here (e.g., fetch or axios)
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Entry</h2>
      
        {/* Description Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Enter overall description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Dynamic Details Fields Container */}
        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">
            Details Specification
          </h3>
          
          <div className="space-y-3">
            {details.map((detail, index) => (
              <div key={index} className="flex gap-2 items-center">
                
                {/* Title Box */}
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={detail.title}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
                
                {/* Content Box */}
                <input
                  type="text"
                  name="content"
                  placeholder="Content details"
                  value={detail.content}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="flex-[2] min-w-0 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
                
                {/* Remove button (Only if array has more than 1 item) */}
                {details.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeDetailRow(index)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                    title="Remove item"
                  >
                    {/* Simple cross icon */}
                    <svg xmlns="http://w3.org" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <button 
            type="button" 
            onClick={addDetailRow} 
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium text-xs rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {/* Plus icon */}
            <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add More
          </button>
        </div>

        {/* Global Form Submit */}
        <button 
          type="submit" 
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;
