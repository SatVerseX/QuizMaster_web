import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { FiDatabase } from 'react-icons/fi';
import { FaFilePdf } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const DownloadModal = ({ attempt, questionAnalysis, onClose, loading, setLoading }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showSuccess, showError, hidePopup } = usePopup();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { 
      text: 'Outstanding Performance! 🌟', 
      description: 'You have demonstrated exceptional mastery of the subject!'
    };
    if (percentage >= 80) return { 
      text: 'Excellent Work! 🎉', 
      description: 'Great job! You have a strong understanding of the concepts.'
    };
    if (percentage >= 70) return { 
      text: 'Good Performance! 👏', 
      description: 'Well done! You\'re on the right track with room for improvement.'
    };
    if (percentage >= 60) return { 
      text: 'Fair Performance 📈', 
      description: 'You\'re making progress! Focus on areas that need improvement.'
    };
    return { 
      text: 'Keep Practicing! 💪', 
      description: 'Don\'t give up! More practice will help you improve significantly.'
    };
  };

  const getStatusColor = (status) => {
    if (status === 'correct' || status === true) return '#10B981'; // green
    if (status === 'incorrect' || status === false) return '#EF4444'; // red
    return '#6B7280'; // gray for skipped
  };

  const getStatusText = (status) => {
    if (status === 'correct' || status === true) return 'Correct';
    if (status === 'incorrect' || status === false) return 'Incorrect';
    return 'Skipped';
  };

  const handleDownloadPDF = async () => {
    setLoading(true);

    try {
      console.log("Starting PDF generation with detailed questions...");
      const scoreMessage = getScoreMessage(attempt.percentage);
      const correctAnswers = questionAnalysis.filter(q => q.isCorrect).length;
      const incorrectAnswers = questionAnalysis.filter(q => q.status === 'incorrect').length;
      const skippedAnswers = questionAnalysis.filter(q => q.status === 'skipped').length;
      
      // Generate question detail HTML
      const questionsHTML = questionAnalysis.map((question, index) => {
        const questionNumber = index + 1;
        const userAnswerText = question.userAnswer !== undefined && question.options ? 
          question.options[question.userAnswer] : 'Not answered';
        const correctAnswerText = question.options ? 
          question.options[question.correctAnswer] : 'Unknown';
          
        return `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h3 style="font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">
              Question ${questionNumber} 
              <span style="float: right; color: ${getStatusColor(question.status || question.isCorrect)}">
                ${getStatusText(question.status || question.isCorrect)}
              </span>
            </h3>
            <p style="margin-bottom: 15px; font-size: 14px;">${question.question}</p>
            
            <div style="margin-bottom: 15px;">
              <p style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">Options:</p>
              <ol style="margin-left: 20px;">
                ${question.options ? question.options.map((option, i) => `
                  <li style="margin-bottom: 3px; font-size: 13px; ${
                    i === question.correctAnswer ? 'color: #10B981; font-weight: bold;' : 
                    (i === question.userAnswer ? 'color: #EF4444; font-weight: bold;' : '')
                  }">
                    ${option} ${i === question.correctAnswer ? '✓' : ''}
                  </li>
                `).join('') : 'Options not available'}
              </ol>
            </div>
            
            <div style="margin-bottom: 10px; font-size: 13px;">
              <p><strong>Your answer:</strong> ${userAnswerText}</p>
              <p><strong>Correct answer:</strong> ${correctAnswerText}</p>
            </div>
            
            ${question.explanation ? `
              <div style="background: #F3F4F6; padding: 10px; border-radius: 5px; font-size: 12px;">
                <p style="font-weight: bold; margin-bottom: 3px;">Explanation:</p>
                <p style="margin: 0;">${question.explanation}</p>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
      
      // Create full report HTML with summary and detailed questions
      const reportHtml = `
        <div id="report" style="font-family: Arial, sans-serif; color: #333; background: white; padding: 20px;">
          <h1 style="text-align: center; margin-bottom: 10px; font-size: 24px; color: #4F46E5;">Test Performance Report</h1>
          <h2 style="text-align: center; margin-bottom: 20px; font-size: 20px;">${attempt.testTitle}</h2>
          
          <table border="0" cellpadding="5" cellspacing="0" width="100%" style="margin-bottom: 15px;">
            <tr>
              <td style="text-align: center; font-size: 36px; font-weight: bold; color: ${attempt.percentage >= 70 ? '#10B981' : '#EF4444'};">
                ${attempt.percentage}%
              </td>
            </tr>
            <tr>
              <td style="text-align: center; font-size: 18px; font-weight: bold;">
                ${scoreMessage.text}
              </td>
            </tr>
          </table>
          
          <table border="0" cellpadding="10" cellspacing="0" width="100%" style="margin-bottom: 20px; border: 1px solid #E5E7EB;">
            <tr>
              <td width="50%" style="border-right: 1px solid #E5E7EB;">
                <strong>Score:</strong> ${attempt.score}/${attempt.totalQuestions}
              </td>
              <td width="50%">
                <strong>Time Taken:</strong> ${formatTime(attempt.timeSpent)}
              </td>
            </tr>
            <tr>
              <td width="50%" style="border-right: 1px solid #E5E7EB; border-top: 1px solid #E5E7EB;">
                <strong>Accuracy:</strong> ${Math.round((attempt.score / attempt.totalQuestions) * 100)}%
              </td>
              <td width="50%" style="border-top: 1px solid #E5E7EB;">
                <strong>Difficulty:</strong> ${attempt.difficulty || 'Medium'}
              </td>
            </tr>
          </table>
          
          <h3 style="margin-bottom: 10px; font-size: 18px;">Answer Breakdown</h3>
          <table border="0" cellpadding="10" cellspacing="0" width="100%" style="margin-bottom: 25px; border: 1px solid #E5E7EB;">
            <tr>
              <td style="border-right: 1px solid #E5E7EB;">
                <strong>Correct:</strong> ${correctAnswers}
              </td>
              <td style="border-right: 1px solid #E5E7EB;">
                <strong>Incorrect:</strong> ${incorrectAnswers}
              </td>
              <td style="border-right: 1px solid #E5E7EB;">
                <strong>Skipped:</strong> ${skippedAnswers}
              </td>
              <td>
                <strong>Flagged:</strong> ${attempt.flaggedQuestions?.length || 0}
              </td>
            </tr>
          </table>
          
          <div style="page-break-after: always;"></div>
          
          <h2 style="margin: 20px 0; font-size: 22px;">Detailed Question Analysis</h2>
          
          ${questionsHTML}
          
          <div style="margin-top: 30px; font-size: 12px; color: #6B7280; text-align: center;">
            <p>Report generated on ${new Date().toLocaleDateString('en-IN')}</p>
            <p>Test completed by: ${currentUser?.displayName || currentUser?.email}</p>
            <p>QuizMaster Test Series Platform</p>
          </div>
        </div>
      `;

      // Create a container
      const reportContainer = document.createElement('div');
      reportContainer.style.position = 'absolute';
      reportContainer.style.left = '-9999px';
      reportContainer.style.background = 'white';
      reportContainer.style.width = '800px'; // Fixed width
      reportContainer.style.padding = '20px';
      reportContainer.innerHTML = reportHtml;
      document.body.appendChild(reportContainer);
      
      console.log("HTML created and added to DOM");

      // Give browser time to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        console.log("Starting conversion to PDF");
        
        // Get the report element
        const element = reportContainer.querySelector('#report');
        
        if (!element || !element.offsetWidth) {
          throw new Error("Report element not properly rendered");
        }
        
        // Use the simplest possible configuration
        const options = {
          margin: 15,
          filename: `test-report-detailed-${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            removeContainer: true
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Force synchronous rendering if possible
        await html2pdf()
          .set(options)
          .from(element)
          .outputPdf('save');
        
        console.log("PDF saved");
        
        onClose();
        setTimeout(() => {
          showSuccess('Complete test report PDF downloaded successfully!', 'PDF Downloaded');
        }, 500);
      } catch (error) {
        console.error("Error in PDF conversion:", error);
        showError(`PDF generation error: ${error.message}`, 'PDF Generation Error');
        
        // Fallback approach - if html2pdf fails, offer data export
        showConfirm(
          "PDF generation failed. Would you like to download the data as JSON instead?",
          "PDF Generation Failed",
          () => handleDownloadJSON()
        );
      } finally {
        if (document.body.contains(reportContainer)) {
          document.body.removeChild(reportContainer);
        }
      }
    } catch (error) {
      console.error('Overall PDF error:', error);
      showError(`Failed to generate PDF: ${error.message}`, 'PDF Generation Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = async () => {
    setLoading(true);
    try {
      const scoreMessage = getScoreMessage(attempt.percentage);
      
      const reportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: currentUser?.email,
          platform: 'QuizMaster',
          version: '1.0'
        },
        testInfo: {
          testId: attempt.testId,
          title: attempt.testTitle,
          series: attempt.testSeriesTitle,
          difficulty: attempt.difficulty,
          takenBy: currentUser?.displayName || currentUser?.email,
          completedAt: formatDate(attempt.completedAt),
          timeSpent: formatTime(attempt.timeSpent),
          timeSpentSeconds: attempt.timeSpent
        },
        performance: {
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          accuracy: Math.round((attempt.score / attempt.totalQuestions) * 100),
          message: scoreMessage.text,
          description: scoreMessage.description
        },
        breakdown: {
          correct: questionAnalysis.filter(q => q.isCorrect).length,
          incorrect: questionAnalysis.filter(q => q.status === 'incorrect').length,
          skipped: questionAnalysis.filter(q => q.status === 'skipped').length,
          flagged: attempt.flaggedQuestions?.length || 0
        },
        detailedQuestions: questionAnalysis.map((q, index) => ({
          questionNumber: index + 1,
          question: q.question,
          options: q.options,
          correctAnswerIndex: q.correctAnswer,
          correctAnswerText: q.options[q.correctAnswer],
          userAnswerIndex: q.userAnswer,
          userAnswerText: q.userAnswer !== undefined ? q.options[q.userAnswer] : 'Not Answered',
          isCorrect: q.isCorrect,
          isFlagged: q.isFlagged,
          status: q.status,
          explanation: q.explanation || 'No explanation provided'
        }))
      };

      const jsonString = JSON.stringify(reportData, null, 2);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-data-${attempt.testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
      setTimeout(() => {
        showSuccess('JSON Data downloaded successfully!', 'JSON Downloaded');
      }, 100);
      
    } catch (error) {
      console.error('Error downloading JSON:', error);
      showError('Failed to download JSON data.', 'Download Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`backdrop-blur-xl border rounded-3xl p-8 max-w-md w-full shadow-2xl ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-600/40' 
          : 'bg-white/95 border-slate-200/60 shadow-slate-200/40'
      }`}>
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>Download Report</h3>
          <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>Choose your preferred format</p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-all duration-300 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark 
                ? 'bg-red-600/20 hover:bg-red-600/30 border-red-500/40 text-red-300' 
                : 'bg-red-100/60 hover:bg-red-200/60 border-red-400/60 text-red-700'
            }`}
          >
            {loading ? (
              <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? 'border-red-400' : 'border-red-600'
              }`}></div>
            ) : (
              <FaFilePdf className="w-6 h-6" />
            )}
            <div className="flex-1 text-left">
              <div className="font-bold">PDF Report</div>
              <div className="text-sm opacity-80">Complete test report with questions & answers</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className={`w-full p-3 rounded-xl transition-colors hover:cursor-pointer ${
            isDark 
              ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' 
              : 'bg-slate-100/60 hover:bg-slate-200/60 text-slate-700 hover:text-slate-800'
          }`}
        >
          Close
        </button>
      </div>

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default DownloadModal;
