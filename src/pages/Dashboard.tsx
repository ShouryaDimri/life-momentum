import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import TodayView from '@/components/TodayView';
import GoalsView from '@/components/GoalsView';
import MilestonesView from '@/components/MilestonesView';
import AddItemModal from '@/components/AddItemModal';

const Dashboard = () => {
  const [activeView, setActiveView] = useState<'today' | 'goals' | 'milestones'>('today');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      
      <main>
        {activeView === 'today' && <TodayView />}
        {activeView === 'goals' && <GoalsView />}
        {activeView === 'milestones' && <MilestonesView />}
      </main>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
      >
        <Button
          size="lg"
          onClick={() => setModalOpen(true)}
          className="h-16 w-16 rounded-full shadow-glow"
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-8 h-8" />
          </motion.div>
        </Button>
      </motion.div>

      <AddItemModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default Dashboard;
