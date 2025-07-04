import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Brain, Trophy, RotateCcw, AlertCircle, RefreshCw, Loader, BookOpen, Lightbulb } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Course } from '../types';
import toast from 'react-hot-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface QuizSummary {
  question: string;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
  isCorrect: boolean;
}

const Quiz: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && user) {
      if (user.isGuest) {
        loadGuestCourse();
      } else {
        fetchCourseAndQuestions();
      }
    }
  }, [courseId, user]);

  const loadGuestCourse = () => {
    // Mock course data for guest users
    const guestCourses = [
      {
        id: 'guest-course-1',
        user_id: 'guest-user',
        title: 'Introduction to the Force',
        description: 'Learn the fundamentals of Force sensitivity and basic Jedi principles.',
        file_url: 'https://example.com/force-intro.pdf',
        file_type: 'application/pdf',
        progress: 75,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'guest-course-2',
        user_id: 'guest-user',
        title: 'Lightsaber Combat Basics',
        description: 'Master the seven forms of lightsaber combat and defensive techniques.',
        file_url: 'https://example.com/lightsaber-combat.pptx',
        file_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        progress: 45,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'guest-course-3',
        user_id: 'guest-user',
        title: 'Meditation and Mindfulness',
        description: 'Develop your connection to the Force through meditation practices.',
        file_url: 'https://example.com/meditation.pdf',
        file_type: 'application/pdf',
        progress: 20,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const foundCourse = guestCourses.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
      loadGuestQuestions(foundCourse);
    } else {
      setError('Course not found');
    }
    setLoading(false);
  };

  const loadGuestQuestions = (courseData: Course) => {
    const guestQuestions: Record<string, QuizQuestion[]> = {
      'guest-course-1': [
        {
          id: '1',
          question: 'What is the Force according to Jedi teachings?',
          options: [
            'An energy field created by all living things that binds the galaxy together',
            'A supernatural power only some possess',
            'A technology developed by ancient civilizations',
            'A form of advanced telepathy'
          ],
          correct_answer: 0,
          explanation: 'The Force is an energy field created by all living things that surrounds us, penetrates us, and binds the galaxy together. This is the fundamental understanding taught by Jedi Masters.'
        },
        {
          id: '2',
          question: 'What is the first step in developing Force sensitivity?',
          options: [
            'Learning lightsaber combat techniques',
            'Meditation and mindfulness practice to quiet the mind',
            'Studying ancient Jedi texts and history',
            'Building a lightsaber crystal'
          ],
          correct_answer: 1,
          explanation: 'Meditation and mindfulness are fundamental to developing Force sensitivity. A quiet, focused mind is essential for perceiving and connecting with the Force.'
        },
        {
          id: '3',
          question: 'What distinguishes the light side from the dark side of the Force?',
          options: [
            'Power level and raw strength in abilities',
            'Emotional control and selflessness vs. passion and selfishness',
            'Age and years of training experience',
            'Natural talent and inherited abilities'
          ],
          correct_answer: 1,
          explanation: 'The light side emphasizes emotional control, selflessness, and peace, while the dark side is driven by passion, anger, and selfishness. This philosophical difference is core to Jedi teachings.'
        },
        {
          id: '4',
          question: 'According to Jedi philosophy, what should guide a Jedi\'s actions?',
          options: [
            'Personal desires and individual goals',
            'Compassion, wisdom, and service to others',
            'Strict adherence to rules without question',
            'The pursuit of power and recognition'
          ],
          correct_answer: 1,
          explanation: 'Jedi are guided by compassion, wisdom, and a commitment to serving others and the greater good, not personal gain or power.'
        },
        {
          id: '5',
          question: 'What role does patience play in Jedi training?',
          options: [
            'It is unnecessary if you have natural talent',
            'It is essential for mastering both Force abilities and emotional control',
            'It only matters for meditation practices',
            'It is less important than aggressive training'
          ],
          correct_answer: 1,
          explanation: 'Patience is fundamental to Jedi training, essential for developing both Force abilities and the emotional control necessary to resist the dark side.'
        }
      ],
      'guest-course-2': [
        {
          id: '1',
          question: 'How many traditional forms of lightsaber combat are there?',
          options: [
            'Five forms',
            'Seven forms',
            'Ten forms',
            'Three forms'
          ],
          correct_answer: 1,
          explanation: 'There are seven traditional forms of lightsaber combat, each with its own philosophy, techniques, and tactical applications.'
        },
        {
          id: '2',
          question: 'What is Form I (Shii-Cho) primarily known for?',
          options: [
            'Aggressive offensive techniques',
            'Basic fundamentals and foundation training',
            'Defensive mastery and protection',
            'Dual-blade combat techniques'
          ],
          correct_answer: 1,
          explanation: 'Form I (Shii-Cho) is the foundation form that teaches basic lightsaber fundamentals and is the first form learned by all Jedi students.'
        },
        {
          id: '3',
          question: 'What is the primary focus of Form III (Soresu)?',
          options: [
            'Overwhelming offensive power',
            'Defensive techniques and protection',
            'Acrobatic movements and agility',
            'Dual-weapon combat'
          ],
          correct_answer: 1,
          explanation: 'Form III (Soresu) is focused on defensive techniques, emphasizing protection and outlasting opponents through superior defense.'
        }
      ],
      'guest-course-3': [
        {
          id: '1',
          question: 'What is the primary purpose of Jedi meditation?',
          options: [
            'To increase physical strength and endurance',
            'To connect with the Force and achieve inner peace',
            'To communicate telepathically with other Jedi',
            'To predict future events with certainty'
          ],
          correct_answer: 1,
          explanation: 'Jedi meditation helps connect with the Force, achieve inner peace, and maintain the emotional balance necessary for a Jedi\'s path.'
        },
        {
          id: '2',
          question: 'How often should a dedicated Jedi practice meditation?',
          options: [
            'Only when facing difficult decisions',
            'Daily, as a regular spiritual practice',
            'Once a week during formal training',
            'Only during times of crisis'
          ],
          correct_answer: 1,
          explanation: 'Daily meditation is essential for maintaining Force connection, emotional balance, and spiritual growth as a Jedi.'
        },
        {
          id: '3',
          question: 'What should a Jedi focus on during meditation?',
          options: [
            'Achieving specific visions or outcomes',
            'Clearing the mind and being present in the moment',
            'Planning future actions and strategies',
            'Analyzing past mistakes and failures'
          ],
          correct_answer: 1,
          explanation: 'Jedi meditation focuses on clearing the mind, being present, and allowing the Force to flow naturally without forcing specific outcomes.'
        }
      ]
    };

    const courseQuestions = guestQuestions[courseData.id] || [];
    setQuestions(courseQuestions);
  };

  const validateQuestionData = (questionData: any): QuizQuestion | null => {
    // Strict validation to prevent crashes
    if (!questionData || typeof questionData !== 'object') {
      return null;
    }

    const {
      id,
      question,
      options,
      correct_answer,
      explanation
    } = questionData;

    // Validate all required fields
    if (
      !id ||
      !question || typeof question !== 'string' ||
      !Array.isArray(options) || options.length !== 4 ||
      !options.every(opt => typeof opt === 'string') ||
      typeof correct_answer !== 'number' ||
      correct_answer < 0 || correct_answer > 3 ||
      !explanation || typeof explanation !== 'string'
    ) {
      console.warn('Invalid question data:', questionData);
      return null;
    }

    return {
      id: String(id),
      question: question.trim(),
      options: options.map(opt => String(opt).trim()),
      correct_answer,
      explanation: explanation.trim()
    };
  };

  const fetchCourseAndQuestions = async () => {
    if (!courseId || !user || user.isGuest) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('user_id', user.id)
        .single();

      if (courseError) {
        throw new Error('Course not found or access denied');
      }
      
      setCourse(courseData);

      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (questionsError) {
        throw new Error('Failed to load quiz questions');
      }

      if (!questionsData || questionsData.length === 0) {
        setError('No quiz questions available for this course yet. Please try re-uploading the course to generate questions.');
        return;
      }

      // Validate and format questions with strict checking
      const validQuestions: QuizQuestion[] = [];
      
      for (const questionData of questionsData) {
        const validatedQuestion = validateQuestionData(questionData);
        if (validatedQuestion) {
          validQuestions.push(validatedQuestion);
        }
      }

      if (validQuestions.length === 0) {
        setError('Quiz questions are corrupted or invalid. Please try re-uploading the course to regenerate questions.');
        return;
      }

      console.log(`Loaded ${validQuestions.length} valid questions out of ${questionsData.length} total`);
      setQuestions(validQuestions);

    } catch (error: any) {
      console.error('Error fetching course and questions:', error);
      setError(error.message || 'Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return; // Prevent selection after showing result
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null || !questions[currentQuestion]) return;

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
        updateCourseProgress(newAnswers);
      }
    }, 2000);
  };

  const updateCourseProgress = async (answers: number[]) => {
    if (!course || !user || questions.length === 0) return;

    const correctAnswers = answers.filter((answer, index) => {
      const question = questions[index];
      return question && answer === question.correct_answer;
    }).length;
    
    const progressPercentage = Math.round((correctAnswers / questions.length) * 100);

    if (user.isGuest) {
      const pointsEarned = correctAnswers * 10;
      toast.success(`Quiz completed! You would have earned ${pointsEarned} points with an account.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update({ progress: Math.max(course.progress, progressPercentage) })
        .eq('id', course.id);

      if (error) throw error;

      // Update user points
      const pointsEarned = correctAnswers * 10;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          total_points: user.total_points + pointsEarned,
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(`Quiz completed! You earned ${pointsEarned} points.`);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowResult(false);
    setQuizCompleted(false);
    setShowSummary(false);
  };

  const retryLoading = () => {
    setLoading(true);
    setError(null);
    if (user?.isGuest) {
      loadGuestCourse();
    } else {
      fetchCourseAndQuestions();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateQuizSummary = (): QuizSummary[] => {
    return questions.map((question, index) => ({
      question: question.question,
      userAnswer: userAnswers[index],
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      isCorrect: userAnswers[index] === question.correct_answer
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-[#3CA7E0] mx-auto mb-4" />
            <p className="text-[#BFC9D9] text-lg">Loading quiz questions...</p>
            <p className="text-[#BFC9D9] text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="max-w-4xl mx-auto p-8">
          <motion.button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-[#3CA7E0] hover:text-[#5ED3F3] transition-colors duration-200 mb-6"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Courses</span>
          </motion.button>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1] text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#2E3A59] mb-4">Quiz Not Available</h1>
            <p className="text-[#BFC9D9] mb-6 max-w-md mx-auto">{error}</p>
            
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={retryLoading}
                className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="h-5 w-5" />
                <span>Retry</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Courses
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No course or questions state
  if (!course || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="max-w-4xl mx-auto p-8">
          <motion.button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-[#3CA7E0] hover:text-[#5ED3F3] transition-colors duration-200 mb-6"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Courses</span>
          </motion.button>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1] text-center">
            <Brain className="h-16 w-16 text-[#BFC9D9] mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#2E3A59] mb-4">No Quiz Available</h1>
            <p className="text-[#BFC9D9] mb-6">
              {course ? 'This course doesn\'t have any quiz questions yet.' : 'Course not found.'}
            </p>
            <motion.button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Courses
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate score safely
  const correctAnswers = userAnswers.filter((answer, index) => {
    const question = questions[index];
    return question && answer === question.correct_answer;
  }).length;
  
  const scorePercentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

  // Get current question safely
  const currentQuestionData = questions[currentQuestion];
  if (!currentQuestionData && !quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1] text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#2E3A59] mb-4">Question Not Found</h1>
            <p className="text-[#BFC9D9] mb-6">The current question could not be loaded.</p>
            <motion.button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Courses
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
      <div className="max-w-4xl mx-auto p-8">
        <motion.button
          onClick={() => navigate('/courses')}
          className="flex items-center space-x-2 text-[#3CA7E0] hover:text-[#5ED3F3] transition-colors duration-200 mb-6"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Courses</span>
        </motion.button>

        {!quizCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1]"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#2E3A59] flex items-center space-x-3">
                  <Brain className="h-7 w-7 text-[#3CA7E0]" />
                  <span>{course.title} - Quiz</span>
                  {user?.isGuest && (
                    <span className="text-sm bg-[#5ED3F3] text-white px-3 py-1 rounded-full">
                      Demo
                    </span>
                  )}
                </h1>
                <div className="text-sm text-[#BFC9D9]">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
              </div>
              
              <div className="w-full bg-[#F3F4F6] rounded-full h-2 mb-6">
                <motion.div
                  className="bg-[#3CA7E0] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-[#2E3A59] mb-6">
                  {currentQuestionData.question}
                </h2>

                <div className="space-y-3 mb-8">
                  {currentQuestionData.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                        showResult
                          ? index === currentQuestionData.correct_answer
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : index === selectedAnswer && index !== currentQuestionData.correct_answer
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-[#CBD5E1] bg-gray-50 text-[#BFC9D9]'
                          : selectedAnswer === index
                          ? 'border-[#3CA7E0] bg-[#5ED3F3]/10 text-[#2E3A59]'
                          : 'border-[#CBD5E1] hover:border-[#3CA7E0] hover:bg-[#5ED3F3]/5 text-[#2E3A59]'
                      }`}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showResult && index === currentQuestionData.correct_answer
                            ? 'border-green-500 bg-green-500'
                            : showResult && index === selectedAnswer && index !== currentQuestionData.correct_answer
                            ? 'border-red-500 bg-red-500'
                            : selectedAnswer === index
                            ? 'border-[#3CA7E0] bg-[#3CA7E0]'
                            : 'border-[#CBD5E1]'
                        }`}>
                          {showResult && index === currentQuestionData.correct_answer && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                          {showResult && index === selectedAnswer && index !== currentQuestionData.correct_answer && (
                            <XCircle className="h-4 w-4 text-white" />
                          )}
                          {!showResult && selectedAnswer === index && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#F5F7FA] rounded-lg p-4 mb-6"
                  >
                    <h3 className="font-semibold text-[#2E3A59] mb-2 flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-[#F59E0B]" />
                      <span>Explanation:</span>
                    </h3>
                    <p className="text-[#BFC9D9]">{currentQuestionData.explanation}</p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <motion.button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={selectedAnswer !== null ? { scale: 1.05 } : {}}
                    whileTap={selectedAnswer !== null ? { scale: 0.95 } : {}}
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1] text-center"
          >
            <Trophy className="h-16 w-16 text-[#3CA7E0] mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#2E3A59] mb-4">Quiz Completed!</h1>
            
            <div className="mb-6">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </div>
              <p className="text-[#BFC9D9]">
                You got {correctAnswers} out of {questions.length} questions correct
              </p>
              {user?.isGuest && (
                <p className="text-sm text-blue-600 mt-2">
                  Create an account to save your progress and earn points!
                </p>
              )}
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <motion.button
                onClick={() => setShowSummary(!showSummary)}
                className="px-6 py-3 bg-[#8B5CF6] text-white rounded-lg font-semibold flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="h-5 w-5" />
                <span>{showSummary ? 'Hide' : 'Show'} Summary</span>
              </motion.button>
              <motion.button
                onClick={restartQuiz}
                className="px-6 py-3 bg-[#5ED3F3] text-white rounded-lg font-semibold flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="h-5 w-5" />
                <span>Retake Quiz</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Courses
              </motion.button>
            </div>

            {/* Quiz Summary */}
            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 text-left"
                >
                  <h3 className="text-xl font-semibold text-[#2E3A59] mb-4 text-center">
                    Quiz Summary with Explanations
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generateQuizSummary().map((summary, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          summary.isCorrect
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3 mb-2">
                          {summary.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-[#2E3A59] mb-2">
                              Question {index + 1}: {summary.question}
                            </p>
                            <p className={`text-sm mb-1 ${
                              summary.isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}>
                              Your answer: {questions[index].options[summary.userAnswer]}
                            </p>
                            {!summary.isCorrect && (
                              <p className="text-sm text-green-700 mb-2">
                                Correct answer: {questions[index].options[summary.correctAnswer]}
                              </p>
                            )}
                            <p className="text-sm text-[#BFC9D9]">
                              {summary.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Quiz;