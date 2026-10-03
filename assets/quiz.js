document.querySelectorAll('[data-quiz]').forEach((quiz) => {
  const button = quiz.querySelector('button')
  const feedback = quiz.querySelector('.feedback')

  button.addEventListener('click', () => {
    const answer = quiz.querySelector('input:checked')

    if (!answer) {
      feedback.textContent = 'Choose one answer first.'
      feedback.dataset.state = 'incorrect'
      return
    }

    const isCorrect = answer.dataset.correct === 'true'
    feedback.textContent = isCorrect ? quiz.dataset.correctFeedback : quiz.dataset.incorrectFeedback
    feedback.dataset.state = isCorrect ? 'correct' : 'incorrect'
  })
})
