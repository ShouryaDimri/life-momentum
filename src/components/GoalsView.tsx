import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { sounds } from '@/lib/sounds';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: 'yearly' | 'monthly';
  target_date: string | null;
  completed: boolean;
}

const GoalsView = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'yearly' | 'monthly'>('yearly');

  useEffect(() => {
    if (!user) return;

    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load goals');
      } else {
        setGoals((data || []) as Goal[]);
      }
    };

    fetchGoals();

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleGoal = async (goalId: string, currentStatus: boolean) => {
    // Optimistic update
    const newStatus = !currentStatus;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: newStatus } : g));
    
    // Play sound
    if (newStatus) {
      sounds.complete();
    } else {
      sounds.toggle();
    }

    const { error } = await supabase
      .from('goals')
      .update({ completed: newStatus })
      .eq('id', goalId);

    if (error) {
      toast.error('Failed to update goal');
      // Revert on error
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: currentStatus } : g));
    }
  };

  const filteredGoals = goals.filter(g => g.goal_type === activeTab);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Your Goals</h1>
        <p className="text-muted-foreground">Set targets and achieve greatness</p>
      </motion.div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Goals & Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'yearly' | 'monthly')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="yearly">Yearly Targets</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Targets</TabsTrigger>
            </TabsList>

            <TabsContent value="yearly">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredGoals.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground text-center py-8"
                    >
                      No yearly goals yet. Click + to add one!
                    </motion.p>
                  ) : (
                    filteredGoals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl bg-gradient-card border border-border/50"
                      >
                        <div className="flex items-start gap-3">
                          <motion.div whileTap={{ scale: 0.9 }} className="mt-1">
                            <Checkbox
                              checked={goal.completed}
                              onCheckedChange={() => toggleGoal(goal.id, goal.completed)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {goal.title}
                            </h3>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                            {goal.target_date && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="monthly">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredGoals.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground text-center py-8"
                    >
                      No monthly goals yet. Click + to add one!
                    </motion.p>
                  ) : (
                    filteredGoals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl bg-gradient-card border border-border/50"
                      >
                        <div className="flex items-start gap-3">
                          <motion.div whileTap={{ scale: 0.9 }} className="mt-1">
                            <Checkbox
                              checked={goal.completed}
                              onCheckedChange={() => toggleGoal(goal.id, goal.completed)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {goal.title}
                            </h3>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                            {goal.target_date && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsView;
