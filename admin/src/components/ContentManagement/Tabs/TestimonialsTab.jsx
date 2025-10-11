import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

const TestimonialsTab = ({ testimonials, setTestimonials }) => {
  const [newTestimonial, setNewTestimonial] = useState({ name: '', content: '', rating: 5 });

  const addTestimonial = () => {
    if (newTestimonial.name.trim() === '' || newTestimonial.content.trim() === '') return;
    const newTest = {
      id: Date.now(),
      name: newTestimonial.name,
      content: newTestimonial.content,
      rating: newTestimonial.rating,
      status: 'pending'
    };
    setTestimonials([...testimonials, newTest]);
    setNewTestimonial({ name: '', content: '', rating: 5 });
  };

  const approveTestimonial = (id) => {
    setTestimonials(testimonials.map(test => 
      test.id === id ? {...test, status: 'approved'} : test
    ));
  };

  const deleteTestimonial = (id) => {
    setTestimonials(testimonials.filter(test => test.id !== id));
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Add New Testimonial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <input
            type="text"
            placeholder="Customer Name"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            value={newTestimonial.name}
            onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              value={newTestimonial.rating}
              onChange={(e) => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          placeholder="Testimonial Content"
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black mb-3"
          value={newTestimonial.content}
          onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
        />
        <button
          className="px-4 py-2 bg-black text-white  hover:bg-black flex items-center"
          onClick={addTestimonial}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Testimonial
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testimonials.map(testimonial => (
              <tr key={testimonial.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testimonial.name}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{testimonial.content}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{'★'.repeat(testimonial.rating)}{'☆'.repeat(5-testimonial.rating)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    testimonial.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {testimonial.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  {testimonial.status !== 'approved' && (
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => approveTestimonial(testimonial.id)}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => deleteTestimonial(testimonial.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestimonialsTab;