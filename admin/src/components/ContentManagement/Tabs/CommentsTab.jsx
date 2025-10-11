import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faReply, faTrash } from '@fortawesome/free-solid-svg-icons';

const CommentsTab = ({ comments, setComments }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const approveComment = (id) => {
    setComments(comments.map(comment => 
      comment.id === id ? {...comment, status: 'approved'} : comment
    ));
  };

  const deleteComment = (id) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  const replyToComment = (id) => {
    if (replyContent.trim() === '') return;
    
    // In a real app, you would save this reply to your database
    alert(`Reply sent to comment #${id}: ${replyContent}`);
    
    setReplyingTo(null);
    setReplyContent('');
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.map(comment => (
              <React.Fragment key={comment.id}>
                <tr>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{comment.post}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{comment.author}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{comment.content}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{comment.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      comment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {comment.status !== 'approved' && (
                      <button 
                        className="text-green-600 hover:text-green-900 mr-3"
                        onClick={() => approveComment(comment.id)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    <button 
                      className="text-black hover:text-blue-900 mr-3"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <FontAwesomeIcon icon={faReply} />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
                {replyingTo === comment.id && (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 bg-gray-50">
                      <div className="flex flex-col md:flex-row gap-2">
                        <textarea
                          placeholder="Type your reply here..."
                          rows="2"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black h-full"
                            onClick={() => replyToComment(comment.id)}
                          >
                            Send Reply
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 h-full"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommentsTab;