import { useState } from 'react'
import useExpenseStore from './store/expenseStore'
import LandingPage from './components/LandingPage'
import CalendarView from './components/CalendarView'
import Analytics from './components/Analytics'
import Insights from './components/Insights'
import BottomNav from './components/BottomNav'
import AddExpenseModal from './components/AddExpenseModal'
import CategoriesManager from './components/CategoriesManager'

export default function App() {
  const currentScreen = useExpenseStore(s => s.currentScreen)
  const [showAdd, setShowAdd]   = useState(false)
  const [showCats, setShowCats] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {currentScreen === 'landing' ? (
        <LandingPage />
      ) : (
        <>
          {currentScreen === 'calendar'  && <CalendarView />}
          {currentScreen === 'analytics' && <Analytics />}
          {currentScreen === 'insights'  && <Insights />}

          <BottomNav
            onAddClick={()        => setShowAdd(true)}
            onCategoriesClick={()  => setShowCats(true)}
          />

          {showAdd && (
            <AddExpenseModal
              date={today}
              onClose={() => setShowAdd(false)}
            />
          )}

          {showCats && (
            <CategoriesManager
              onClose={() => setShowCats(false)}
            />
          )}
        </>
      )}

    </div>
  )
}