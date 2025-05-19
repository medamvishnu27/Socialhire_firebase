// src/pages/admin/PlacementCRUD.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources, addResource, deleteResource, fetchTips, addTip, updateTip, deleteTip, fetchFaqs, addFaq, updateFaq, deleteFaq } from '../../redux/slices/placementSlice';

const PlacementCRUD = () => {
  const dispatch = useDispatch();
  const { resources, tips, faqs, status } = useSelector((state) => state.placement);
  const [resourceForm, setResourceForm] = useState({ file: null, title: '', description: '', type: 'PDF' });
  const [tipForm, setTipForm] = useState({ id: '', title: '', description: '' });
  const [faqForm, setFaqForm] = useState({ id: '', question: '', answer: '' });

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchTips());
    dispatch(fetchFaqs());
  }, [dispatch]);

  const handleResourceSubmit = (e) => {
    e.preventDefault();
    dispatch(addResource(resourceForm));
    setResourceForm({ file: null, title: '', description: '', type: 'PDF' });
  };

  const handleTipSubmit = (e) => {
    e.preventDefault();
    if (tipForm.id) {
      dispatch(updateTip(tipForm));
    } else {
      dispatch(addTip({ title: tipForm.title, description: tipForm.description }));
    }
    setTipForm({ id: '', title: '', description: '' });
  };

  const handleFaqSubmit = (e) => {
    e.preventDefault();
    if (faqForm.id) {
      dispatch(updateFaq(faqForm));
    } else {
      dispatch(addFaq({ question: faqForm.question, answer: faqForm.answer }));
    }
    setFaqForm({ id: '', question: '', answer: '' });
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin: Placement Management</h1>

        {/* Resources CRUD */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resources</h2>
          <form onSubmit={handleResourceSubmit} className="mb-6">
            <input type="file" accept="application/pdf" onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files[0] })} className="mb-2" />
            <input type="text" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="Title" className="mb-2 p-2 border rounded w-full" />
            <textarea value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} placeholder="Description" className="mb-2 p-2 border rounded w-full" />
            <select value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} className="mb-2 p-2 border rounded">
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Interactive">Interactive</option>
            </select>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Add Resource</button>
          </form>
          <ul className="space-y-2">
            {resources.map(resource => (
              <li key={resource.id} className="flex justify-between items-center p-2 bg-white rounded shadow">
                <span>{resource.title} ({resource.type})</span>
                <button onClick={() => dispatch(deleteResource({ id: resource.id, link: resource.link }))} className="text-red-600 hover:text-red-800">Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tips CRUD */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Interview Tips</h2>
          <form onSubmit={handleTipSubmit} className="mb-6">
            <input type="text" value={tipForm.title} onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })} placeholder="Title" className="mb-2 p-2 border rounded w-full" />
            <textarea value={tipForm.description} onChange={(e) => setTipForm({ ...tipForm, description: e.target.value })} placeholder="Description" className="mb-2 p-2 border rounded w-full" />
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">{tipForm.id ? 'Update Tip' : 'Add Tip'}</button>
          </form>
          <ul className="space-y-2">
            {tips.map(tip => (
              <li key={tip.id} className="flex justify-between items-center p-2 bg-white rounded shadow">
                <span>{tip.title}</span>
                <div>
                  <button onClick={() => setTipForm(tip)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button onClick={() => dispatch(deleteTip(tip.id))} className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQs CRUD */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">FAQs</h2>
          <form onSubmit={handleFaqSubmit} className="mb-6">
            <input type="text" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="Question" className="mb-2 p-2 border rounded w-full" />
            <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} placeholder="Answer" className="mb-2 p-2 border rounded w-full" />
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">{faqForm.id ? 'Update FAQ' : 'Add FAQ'}</button>
          </form>
          <ul className="space-y-2">
            {faqs.map(faq => (
              <li key={faq.id} className="flex justify-between items-center p-2 bg-white rounded shadow">
                <span>{faq.question}</span>
                <div>
                  <button onClick={() => setFaqForm(faq)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button onClick={() => dispatch(deleteFaq(faq.id))} className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlacementCRUD;