import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Trophy, ArrowRight, Home, Volume2, X } from 'lucide-react'
import Confetti from 'react-confetti'
import { supabase, User, GameProgress } from '../lib/supabase'
import { useAudioWithFetch } from '../hooks/useAudioWithFetch'
import SoundButton from './SoundButton'

interface GameScreenProps {
  user: User
  onHome: () => void
}

interface Question {
  num1: number
  num2: number
  operation: string
  answer: number
  display: string
  choices: number[]
  objects?: { group1: string; group2: string }
}

const operations = [
  { name: 'addition', symbol: '+', levels: 12 },
  { name: 'subtraction', symbol: '-', levels: 12 },
  { name: 'multiplication', symbol: '×', levels: 12 },
  { name: 'division', symbol: '÷', levels: 12 }
]

const congratulationsMessages = [
  'Fantastic',
  'Amazing', 
  'Clever',
  'Brilliant',
  'Brainy',
  'Witty',
  'Out Of This World',
  'Incredible',
  'Bravo',
  'Proud of You',
  'Way to Go',
  'Well Done',
  'Great Work',
  'So Good',
  'You Are Clever',
  'Too Good',
  'Better Then Me',
  'Better Then Your Dad',
  'Amaaaaazing',
  'Whow Whew'
]

const endingMessages = [
  "You're Brilliant",
  "Fantastic Work",
  "The Best",
  "Wonderful Effort",
  "You're Good",
  "Champion"
]

const countingObjects = [
  '🎾', '🏀', '⚽', '🏈', '🎱', '🏐', '🏓', '🥎',
  '🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
  '⭐', '🌟', '✨', '💎', '🔮', '🎈', '🎁', '🧸',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🌼'
]

const GameScreen: React.FC<GameScreenProps> = ({ user, onHome }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [showLevelComplete, setShowLevelComplete] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [endingMessageIndex, setEndingMessageIndex] = useState(0)
  const { isMuted, toggleMute, stopAudio, playSuccessSound } = useAudioWithFetch()

  const currentOperation = operations.find(op => op.name === user.current_operation)!
  const maxLevel = currentOperation.levels

  useEffect(() => {
    // Stop splash music when entering game screen
    stopAudio()
    generateQuestion()
  }, [user.current_level, user.current_operation])

  const getRandomObjects = () => {
    const shuffled = [...countingObjects].sort(() => Math.random() - 0.5)
    return {
      group1: shuffled[0],
      group2: shuffled[1]
    }
  }

  const getRandomCongratulation = () => {
    const randomMessage = congratulationsMessages[Math.floor(Math.random() * congratulationsMessages.length)]
    return randomMessage
  }

  const getNextEndingMessage = () => {
    const message = endingMessages[endingMessageIndex]
    setEndingMessageIndex((prev) => (prev + 1) % endingMessages.length)
    return message
  }

  const generateMultipleChoices = (correctAnswer: number): number[] => {
    const choices = [correctAnswer]
    
    while (choices.length < 3) {
      let wrongAnswer
      if (correctAnswer <= 5) {
        wrongAnswer = Math.max(0, correctAnswer + Math.floor(Math.random() * 6) - 3)
      } else {
        wrongAnswer = Math.max(0, correctAnswer + Math.floor(Math.random() * 10) - 5)
      }
      
      if (!choices.includes(wrongAnswer) && wrongAnswer >= 0) {
        choices.push(wrongAnswer)
      }
    }
    
    // Shuffle the choices
    return choices.sort(() => Math.random() - 0.5)
  }

  const generateQuestion = () => {
    const level = user.current_level
    let question: Question
    const objects = getRandomObjects()

    switch (user.current_operation) {
      case 'addition':
        const add1 = Math.floor(Math.random() * Math.min(level + 2, 10)) + 1
        const add2 = Math.floor(Math.random() * Math.min(level + 2, 10)) + 1
        const addAnswer = add1 + add2
        question = {
          num1: add1,
          num2: add2,
          operation: '+',
          answer: addAnswer,
          display: `${add1} + ${add2}`,
          choices: generateMultipleChoices(addAnswer),
          objects: objects
        }
        break

      case 'subtraction':
        const sub1 = Math.floor(Math.random() * Math.min(level + 5, 15)) + Math.min(level, 10)
        const sub2 = Math.floor(Math.random() * sub1) + 1
        const subAnswer = sub1 - sub2
        question = {
          num1: sub1,
          num2: sub2,
          operation: '-',
          answer: subAnswer,
          display: `${sub1} - ${sub2}`,
          choices: generateMultipleChoices(subAnswer),
          objects: objects
        }
        break

      case 'multiplication':
        const mult1 = Math.floor(Math.random() * Math.min(level + 1, 12)) + 1
        const mult2 = Math.floor(Math.random() * Math.min(level + 1, 12)) + 1
        const multAnswer = mult1 * mult2
        question = {
          num1: mult1,
          num2: mult2,
          operation: '×',
          answer: multAnswer,
          display: `${mult1} × ${mult2}`,
          choices: generateMultipleChoices(multAnswer),
          objects: objects
        }
        break

      case 'division':
        const div2 = Math.floor(Math.random() * Math.min(level + 1, 12)) + 1
        const answer = Math.floor(Math.random() * Math.min(level + 1, 12)) + 1
        const div1 = div2 * answer
        question = {
          num1: div1,
          num2: div2,
          operation: '÷',
          answer: answer,
          display: `${div1} ÷ ${div2}`,
          choices: generateMultipleChoices(answer),
          objects: objects
        }
        break

      default:
        question = { 
          num1: 1, 
          num2: 1, 
          operation: '+', 
          answer: 2, 
          display: '1 + 1',
          choices: [2, 1, 3],
          objects: objects
        }
    }

    setCurrentQuestion(question)
    setSelectedAnswer(null)
    setFeedback('')
  }

  const handleAnswerSelect = async (answer: number) => {
    if (!currentQuestion) return

    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.answer

    setIsCorrect(correct)

    if (correct) {
      setScore(score + 10)
      const congratulation = getRandomCongratulation()
      const endingMessage = getNextEndingMessage()
      setFeedback(`${congratulation}, ${user.username}! ${endingMessage}! 🌟`)
      setShowCelebration(true)
      
      // Play success sound
      await playSuccessSound()
      
      setTimeout(() => {
        setShowCelebration(false)
        setQuestionsAnswered(prev => {
          const newCount = prev + 1
          if (newCount >= 5) { // 5 questions per level
            handleLevelComplete()
            return 0
          } else {
            generateQuestion()
            return newCount
          }
        })
      }, 8000) // Extended to 8 seconds for correct answers
    } else {
      setFeedback(`Good try, ${user.username}! The answer is ${currentQuestion.answer}. Let's try another one! 💪`)
      setTimeout(() => {
        generateQuestion()
      }, 5000)
    }
  }

  const handleResetClick = () => {
    setShowResetConfirm(true)
  }

  const handleResetConfirm = async () => {
    // Reset user to level 1 of addition
    await supabase
      .from('users')
      .update({
        current_level: 1,
        current_operation: 'addition',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Refresh the page to get updated user data
    window.location.reload()
  }

  const handleResetCancel = () => {
    setShowResetConfirm(false)
  }

  const handleLevelComplete = async () => {
    setShowLevelComplete(true)
    
    // Update user progress in database
    const nextLevel = user.current_level + 1
    let nextOperation = user.current_operation

    if (nextLevel > maxLevel) {
      const currentOpIndex = operations.findIndex(op => op.name === user.current_operation)
      if (currentOpIndex < operations.length - 1) {
        nextOperation = operations[currentOpIndex + 1].name
        await supabase
          .from('users')
          .update({
            current_level: 1,
            current_operation: nextOperation,
            total_score: user.total_score + score,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } else {
      await supabase
        .from('users')
        .update({
          current_level: nextLevel,
          total_score: user.total_score + score,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    // Record level completion
    await supabase
      .from('game_progress')
      .insert({
        user_id: user.id,
        operation_type: user.current_operation,
        level: user.current_level,
        completed: true,
        best_score: score,
        completed_at: new Date().toISOString()
      })

    setTimeout(() => {
      window.location.reload() // Refresh to get updated user data
    }, 3000)
  }

  const renderMathObjects = () => {
    if (!currentQuestion || !currentQuestion.objects) return null

    const objects = []
    
    if (currentQuestion.operation === '+') {
      // Show visual objects for addition
      for (let i = 0; i < currentQuestion.num1; i++) {
        objects.push(
          <motion.div
            key={`group1-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-4xl sm:text-6xl"
          >
            {currentQuestion.objects.group1}
          </motion.div>
        )
      }
      
      objects.push(
        <div key="plus" className="text-6xl sm:text-8xl font-bold text-bluey-blue mx-2 sm:mx-4">+</div>
      )
      
      for (let i = 0; i < currentQuestion.num2; i++) {
        objects.push(
          <motion.div
            key={`group2-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (currentQuestion.num1 + i) * 0.1 }}
            className="text-4xl sm:text-6xl"
          >
            {currentQuestion.objects.group2}
          </motion.div>
        )
      }
    } else if (currentQuestion.operation === '-') {
      // Show visual objects for subtraction
      for (let i = 0; i < currentQuestion.num1; i++) {
        const isRemoved = i >= currentQuestion.answer
        objects.push(
          <motion.div
            key={`sub-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: isRemoved ? 0.3 : 1 }}
            transition={{ delay: i * 0.1 }}
            className={`text-4xl sm:text-6xl ${isRemoved ? 'line-through' : ''}`}
          >
            {currentQuestion.objects.group1}
          </motion.div>
        )
      }
    } else if (currentQuestion.operation === '×') {
      // Show visual objects for multiplication (groups)
      for (let group = 0; group < currentQuestion.num1; group++) {
        const groupObjects = []
        for (let item = 0; item < currentQuestion.num2; item++) {
          groupObjects.push(
            <motion.div
              key={`mult-${group}-${item}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (group * currentQuestion.num2 + item) * 0.1 }}
              className="text-2xl sm:text-4xl"
            >
              {currentQuestion.objects.group1}
            </motion.div>
          )
        }
        objects.push(
          <div key={`group-${group}`} className="flex flex-wrap gap-1 p-1 sm:p-2 border-2 border-dashed border-bluey-blue rounded-lg">
            {groupObjects}
          </div>
        )
      }
    } else if (currentQuestion.operation === '÷') {
      // Show visual objects for division
      const itemsPerGroup = currentQuestion.answer
      const totalGroups = currentQuestion.num2
      
      for (let group = 0; group < totalGroups; group++) {
        const groupObjects = []
        for (let item = 0; item < itemsPerGroup; item++) {
          groupObjects.push(
            <motion.div
              key={`div-${group}-${item}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (group * itemsPerGroup + item) * 0.1 }}
              className="text-2xl sm:text-4xl"
            >
              {currentQuestion.objects.group1}
            </motion.div>
          )
        }
        objects.push(
          <div key={`div-group-${group}`} className="flex flex-wrap gap-1 p-1 sm:p-2 border-2 border-dashed border-bluey-green rounded-lg">
            {groupObjects}
          </div>
        )
      }
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-8 p-2 sm:p-4">
        {objects}
      </div>
    )
  }

  if (!currentQuestion) return <div>Loading...</div>

  return (
    <div className="min-h-screen p-2 sm:p-4 relative">
      {showCelebration && <Confetti recycle={false} numberOfPieces={200} />}
      
      <SoundButton isMuted={isMuted} onToggle={toggleMute} />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-6">
        <button
          onClick={onHome}
          className="flex items-center gap-1 sm:gap-2 bg-white rounded-full px-2 py-1 sm:px-4 sm:py-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-bluey-blue" />
          <span className="font-bold text-bluey-blue text-sm sm:text-base">Home</span>
        </button>
        
        <div className="text-center">
          <h2 className="text-lg sm:text-2xl font-fun text-white">
            {user.username}'s Math Adventure
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-1 sm:mt-2">
            <span className="bg-white rounded-full px-2 py-1 sm:px-4 sm:py-1 text-bluey-blue font-bold text-xs sm:text-base">
              {currentOperation.name.charAt(0).toUpperCase() + currentOperation.name.slice(1)} - Level {user.current_level}
            </span>
            <span className="bg-bluey-yellow rounded-full px-2 py-1 sm:px-4 sm:py-1 text-white font-bold flex items-center gap-1 text-xs sm:text-base">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              {score}
            </span>
          </div>
        </div>
        
        <div className="w-12 sm:w-20"></div>
      </div>

      {/* Game Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {showLevelComplete ? (
            <motion.div
              key="level-complete"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-game text-center"
            >
              {/* Game Author Attribution - Top Center Inside Window */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 sm:mb-6"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2 shadow-lg inline-block">
                  <p className="text-xs sm:text-sm font-bold text-bluey-blue">
                    Game Author:- Your Poppy
                  </p>
                </div>
              </motion.div>

              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-bluey-yellow mx-auto mb-2 sm:mb-4" />
              </motion.div>
              <h2 className="text-2xl sm:text-4xl font-fun text-bluey-blue mb-2 sm:mb-4">
                Amazing work, {user.username}! 🎉
              </h2>
              <p className="text-lg sm:text-xl text-bluey-purple mb-4 sm:mb-6">
                You've completed Level {user.current_level} of {currentOperation.name}!
              </p>
              <div className="text-base sm:text-lg text-bluey-blue">
                Moving to the next challenge... 🚀
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="card-game text-center"
            >
              {/* Game Author Attribution - Top Center Inside Window */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 sm:mb-6"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2 shadow-lg inline-block">
                  <p className="text-xs sm:text-sm font-bold text-bluey-blue">
                    Game Author:- Your Poppy
                  </p>
                </div>
              </motion.div>

              {/* Question */}
              <div className="mb-4 sm:mb-8">
                <p className="text-lg sm:text-2xl text-bluey-purple mb-2 sm:mb-4 font-bold">
                  Hey {user.username}, can you solve this? 🤔
                </p>
                <div className="text-4xl sm:text-6xl md:text-8xl font-bold text-bluey-blue drop-shadow-lg mb-3 sm:mb-6">
                  {currentQuestion.display} = ?
                </div>
              </div>

              {/* Visual Objects */}
              {renderMathObjects()}

              {/* Multiple Choice Answers - Now Horizontal on Mobile */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <p className="text-lg sm:text-xl text-bluey-blue font-bold mb-2 sm:mb-4">
                  Choose the correct answer:
                </p>
                <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center">
                  {currentQuestion.choices.map((choice, index) => (
                    <motion.button
                      key={choice}
                      onClick={() => handleAnswerSelect(choice)}
                      disabled={selectedAnswer !== null}
                      whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
                      whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
                      className={`
                        w-16 h-16 sm:w-24 sm:h-24 text-xl sm:text-3xl font-bold rounded-2xl border-4 transition-all
                        ${selectedAnswer === null 
                          ? 'bg-white border-bluey-blue text-bluey-blue hover:bg-bluey-blue hover:text-white cursor-pointer' 
                          : selectedAnswer === choice
                            ? choice === currentQuestion.answer
                              ? 'bg-green-500 border-green-600 text-white'
                              : 'bg-red-500 border-red-600 text-white'
                            : choice === currentQuestion.answer
                              ? 'bg-green-500 border-green-600 text-white'
                              : 'bg-gray-300 border-gray-400 text-gray-600'
                        }
                        disabled:cursor-not-allowed
                      `}
                    >
                      {choice}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Enhanced Feedback with Bouncing Animation */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1, 
                      scale: 1,
                      ...(isCorrect && {
                        y: [-5, 5, -5],
                        rotate: [-2, 2, -2]
                      })
                    }}
                    exit={{ y: -20, opacity: 0, scale: 0.8 }}
                    transition={{
                      y: isCorrect ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
                      rotate: isCorrect ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
                      scale: { duration: 0.3 }
                    }}
                    className={`mt-4 sm:mt-6 p-3 sm:p-6 rounded-2xl font-bold ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800 border-2 border-green-300 text-2xl sm:text-4xl' 
                        : 'bg-blue-100 text-blue-800 border-2 border-blue-300 text-lg sm:text-2xl'
                    }`}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress */}
              <div className="mt-4 sm:mt-8 flex justify-center">
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                        i < questionsAnswered ? 'bg-bluey-green' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-xl sm:text-2xl font-bold text-bluey-blue mb-4">
                  Are you sure you want to reset your game?
                </h3>
                <p className="text-bluey-purple mb-6 text-sm sm:text-base">
                  This will take you back to Level 1 of Addition and you'll lose your current progress.
                </p>
                
                <div className="flex gap-3 sm:gap-4 justify-center">
                  <motion.button
                    onClick={handleResetConfirm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 sm:px-8 rounded-2xl border-4 border-green-600 shadow-lg transition-all text-sm sm:text-base"
                  >
                    Yes, Reset
                  </motion.button>
                  
                  <motion.button
                    onClick={handleResetCancel}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 sm:px-8 rounded-2xl border-4 border-red-600 shadow-lg transition-all text-sm sm:text-base"
                  >
                    No, Keep Playing
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bluey Character - Now a Reset Button */}
      <motion.button
        onClick={handleResetClick}
        className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-bluey-blue to-blue-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:shadow-3xl transition-all"
        animate={{
          y: [-5, 5, -5],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Click to restart from Level 1!"
      >
        <div className="text-2xl sm:text-3xl">🐕</div>
      </motion.button>
    </div>
  )
}

export default GameScreen
