import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiUpload,
  FiBook,
  FiAlertCircle
} from 'react-icons/fi';

const ExaminationLogosManager = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: ''
  });

  // Predefined examination websites
  const examinationWebsites = [
    { value: 'upsc', label: 'UPSC - Union Public Service Commission', url: 'https://upsc.gov.in' },
    { value: 'jee', label: 'JEE - Joint Entrance Examination', url: 'https://jeemain.nta.nic.in' },
    { value: 'neet', label: 'NEET - National Eligibility cum Entrance Test', url: 'https://neet.nta.nic.in' },
    { value: 'cat', label: 'CAT - Common Admission Test', url: 'https://iimcat.ac.in' },
    { value: 'gate', label: 'GATE - Graduate Aptitude Test in Engineering', url: 'https://gate.iitk.ac.in' },
    { value: 'ssc', label: 'SSC - Staff Selection Commission', url: 'https://ssc.nic.in' },
    { value: 'banking', label: 'Banking Examinations (IBPS, SBI)', url: 'https://www.ibps.in' },
    { value: 'teaching', label: 'Teaching Eligibility Tests (CTET, TET)', url: 'https://ctet.nic.in' },
    { value: 'clat', label: 'CLAT - Common Law Admission Test', url: 'https://consortiumofnlus.ac.in' },
    { value: 'aieee', label: 'AIEEE - All India Engineering Entrance Examination', url: 'https://jeemain.nta.nic.in' },
    { value: 'aipmt', label: 'AIPMT - All India Pre Medical Test', url: 'https://neet.nta.nic.in' },
    { value: 'iit', label: 'IIT - Indian Institutes of Technology', url: 'https://iit.ac.in' },
    { value: 'nit', label: 'NIT - National Institutes of Technology', url: 'https://nit.ac.in' },
    { value: 'iim', label: 'IIM - Indian Institutes of Management', url: 'https://iim.ac.in' },
    { value: 'custom', label: 'Custom Examination', url: '' }
  ];

  const mode = (light, dark) => (isDark ? dark : light);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'examinationLogos'));
      const logosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogos(logosData);
    } catch (error) {
      console.error('Error fetching logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.imageUrl) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Get the selected examination details
      const selectedExam = examinationWebsites.find(exam => exam.value === formData.name);
      const logoData = {
        name: selectedExam ? selectedExam.label : formData.name,
        imageUrl: formData.imageUrl,
        websiteUrl: selectedExam ? selectedExam.url : '',
        examCode: formData.name
      };

      if (editingId) {
        // Update existing logo
        await updateDoc(doc(db, 'examinationLogos', editingId), logoData);
        setLogos(prev => prev.map(logo => 
          logo.id === editingId ? { ...logo, ...logoData } : logo
        ));
        setEditingId(null);
      } else {
        // Add new logo
        const docRef = await addDoc(collection(db, 'examinationLogos'), {
          ...logoData,
          createdAt: new Date(),
          createdBy: currentUser.uid
        });
        setLogos(prev => [...prev, { id: docRef.id, ...logoData }]);
        setShowAddForm(false);
      }
      
      setFormData({ name: '', imageUrl: '' });
    } catch (error) {
      console.error('Error saving logo:', error);
      alert('Error saving logo. Please try again.');
    }
  };

  const handleEdit = (logo) => {
    setEditingId(logo.id);
    setFormData({
      name: logo.examCode || logo.name,
      imageUrl: logo.imageUrl
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this logo?')) {
      try {
        await deleteDoc(doc(db, 'examinationLogos', id));
        setLogos(prev => prev.filter(logo => logo.id !== id));
      } catch (error) {
        console.error('Error deleting logo:', error);
        alert('Error deleting logo. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', imageUrl: '' });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${mode("bg-white", "bg-gray-900")}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${mode("bg-white", "bg-gray-900")}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${mode("text-slate-800", "text-white")}`}>
              Examination Logos Manager
            </h1>
            <p className={`${mode("text-slate-600", "text-gray-400")}`}>
              Manage examination logos displayed on the welcome page
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${mode(
              "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
              "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
            )}`}
          >
            <FiPlus className="w-5 h-5" />
            Add Logo
          </button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className={`mb-8 p-6 rounded-2xl border-2 shadow-xl ${mode(
            "bg-slate-50 border-slate-200 hover:border-slate-300",
            "bg-gray-800/80 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50"
          )}`}>
            <h3 className={`text-xl font-semibold mb-4 ${mode("text-slate-800", "text-white")}`}>
              {editingId ? 'Edit Logo' : 'Add New Logo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${mode("text-slate-700", "text-gray-300")}`}>
                    Examination Website *
                  </label>
                                                <select
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 ${mode(
                                  "bg-white border-slate-300 text-slate-800 hover:border-slate-400",
                                  "bg-gray-700/80 backdrop-blur-xl border-gray-600/50 text-white hover:border-gray-500/50"
                                )}`}
                                required
                              >
                    <option value="">Select an examination website</option>
                    {examinationWebsites.map((exam) => (
                      <option key={exam.value} value={exam.value}>
                        {exam.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${mode("text-slate-700", "text-gray-300")}`}>
                    Cloudinary Image URL *
                  </label>
                                                <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 ${mode(
                                  "bg-white border-slate-300 text-slate-800 hover:border-slate-400 placeholder-slate-500",
                                  "bg-gray-700/80 backdrop-blur-xl border-gray-600/50 text-white hover:border-gray-500/50 placeholder-gray-400"
                                )}`}
                                placeholder="https://res.cloudinary.com/.../logo.png"
                                required
                              />
                </div>
              </div>
              
              {/* Preview */}
              {formData.imageUrl && (
                <div className={`p-4 rounded-xl border-2 shadow-lg ${mode("bg-white border-slate-200", "bg-gray-700/80 backdrop-blur-xl border-gray-600/50")}`}>
                  <label className={`block text-sm font-medium mb-2 ${mode("text-slate-700", "text-gray-300")}`}>
                    Preview:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={formData.imageUrl}
                        alt={formData.name}
                        className="w-16 h-16 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                                                        <div className={`hidden w-16 h-16 rounded-full flex items-center justify-center ${mode(
                                    "bg-slate-100 border-2 border-slate-200",
                                    "bg-gray-600/80 backdrop-blur-xl border-2 border-gray-500/50"
                                  )}`}>
                                    <FiBook className={`w-8 h-8 ${mode("text-slate-400", "text-gray-400")}`} />
                                  </div>
                    </div>
                    <div>
                      <p className={`font-medium ${mode("text-slate-800", "text-white")}`}>
                        {examinationWebsites.find(exam => exam.value === formData.name)?.label || formData.name}
                      </p>
                      {formData.name && examinationWebsites.find(exam => exam.value === formData.name)?.url && (
                        <p className={`text-sm ${mode("text-slate-600", "text-gray-400")}`}>
                          {examinationWebsites.find(exam => exam.value === formData.name)?.url}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

                                        <div className="flex gap-3">
                            <button
                              type="submit"
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${mode(
                                "bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-500/30",
                                "bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-400/30"
                              )}`}
                            >
                              <FiSave className="w-5 h-5" />
                              {editingId ? 'Update Logo' : 'Add Logo'}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${mode(
                                "bg-slate-200 text-slate-700 hover:bg-slate-300 border-2 border-slate-300/50",
                                "bg-gray-700/80 backdrop-blur-xl text-gray-300 hover:bg-gray-600/80 border-2 border-gray-600/50"
                              )}`}
                            >
                              <FiX className="w-5 h-5" />
                              Cancel
                            </button>
                          </div>
            </form>
          </div>
        )}

        {/* Logos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${mode(
                "bg-white border-slate-200 hover:border-blue-300 shadow-lg",
                "bg-gray-800/80 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 shadow-xl"
              )}`}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 flex items-center justify-center">
                  <img
                    src={logo.imageUrl}
                    alt={logo.alt || logo.name}
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                                                <div className={`hidden w-20 h-20 rounded-full flex items-center justify-center ${mode(
                                "bg-slate-100 border-2 border-slate-200",
                                "bg-gray-600/80 backdrop-blur-xl border-2 border-gray-500/50"
                              )}`}>
                                <FiBook className={`w-12 h-12 ${mode("text-slate-400", "text-gray-400")}`} />
                              </div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h3 className={`text-lg font-semibold mb-2 ${mode("text-slate-800", "text-white")}`}>
                  {logo.name}
                </h3>
                {logo.websiteUrl && (
                  <p className={`text-sm ${mode("text-slate-600", "text-gray-400")}`}>
                    {logo.websiteUrl}
                  </p>
                )}
              </div>

                                        <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(logo)}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg ${mode(
                                "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200",
                                "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30"
                              )}`}
                            >
                              <FiEdit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(logo.id)}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg ${mode(
                                "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200",
                                "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30"
                              )}`}
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {logos.length === 0 && !showAddForm && (
          <div className={`text-center py-12 ${mode("bg-slate-50", "bg-gray-800/80 backdrop-blur-xl")} rounded-2xl border-2 shadow-xl ${mode("border-slate-200", "border-gray-700/50")}`}>
            <FiBook className={`w-16 h-16 mx-auto mb-4 ${mode("text-slate-400", "text-gray-500")}`} />
            <h3 className={`text-xl font-semibold mb-2 ${mode("text-slate-800", "text-white")}`}>
              No Logos Added Yet
            </h3>
            <p className={`mb-4 ${mode("text-slate-600", "text-gray-400")}`}>
              Start by adding your first examination logo to display on the welcome page.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${mode(
                "bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-500/30",
                "bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-400/30"
              )}`}
            >
              <FiPlus className="w-5 h-5" />
              Add Your First Logo
            </button>
          </div>
        )}

                {/* Instructions */}
        <div className={`mt-8 p-6 rounded-2xl border-2 shadow-xl ${mode(
          "bg-blue-50 border-blue-200",
          "bg-blue-900/20 backdrop-blur-xl border-blue-700/50"
        )}`}>
          <div className="flex items-start gap-3">
            <FiAlertCircle className={`w-6 h-6 mt-1 ${mode("text-blue-600", "text-blue-400")}`} />
            <div>
              <h4 className={`font-semibold mb-2 ${mode("text-blue-800", "text-blue-300")}`}>
                How to Add Logos
              </h4>
                              <ul className={`space-y-1 text-sm ${mode("text-blue-700", "text-blue-400")}`}>
                  <li>• Select an examination website from the dropdown menu</li>
                  <li>• Upload your logo image to Cloudinary first</li>
                  <li>• Copy the Cloudinary URL and paste it in the Image URL field</li>
                  <li>• Logos will automatically appear on the welcome page in rotating animation</li>
                  <li>• Recommended image size: 200x200px PNG with transparent background</li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationLogosManager;
