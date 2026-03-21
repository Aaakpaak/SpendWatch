import useExpenseStore from './store/expenseStore'
import LandingPage from './components/LandingPage'
import CalendarView from './components/CalendarView'
import Analytics from './components/Analytics'
import Insights from './components/Insights'
import BottomNav from './components/BottomNav'

export default function App() {
  const currentScreen = useExpenseStore(s => s.currentScreen)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Show landing OR the main app */}
      {currentScreen === 'landing' ? (
        <LandingPage />
      ) : (
        <>
          {currentScreen === 'calendar'  && <CalendarView />}
          {currentScreen === 'analytics' && <Analytics />}
          {currentScreen === 'insights'  && <Insights />}
          <BottomNav />
        </>
      )}

    </div>
  )
}