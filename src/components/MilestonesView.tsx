import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { sounds } from '@/lib/sounds';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  target_date: string | null;
  goal_id: string | null;
}

interface Goal {
  id: string;
  title: string;
}

const MilestonesView = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (milestonesError) {
        toast.error('Failed to load milestones');
      } else {
        setMilestones(milestonesData || []);
      }

      // Fetch goals for reference
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('id, title')
        .eq('user_id', user.id);

      if (goalsError) {
        console.error('Failed to load goals');
      } else {
        setGoals(goalsData || []);
      }
    };

    fetchData();

    const channel = supabase
      .channel('milestones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    // Optimistic update
    const newStatus = !currentStatus;
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, completed: newStatus } : m));
    
    // Play sound
    if (newStatus) {
      sounds.complete();
    } else {
      sounds.toggle();
    }

    const { error } = await supabase
      .from('milestones')
      .update({ completed: newStatus })
      .eq('id', milestoneId);

    if (error) {
      toast.error('Failed to update milestone');
      // Revert on error
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, completed: currentStatus } : m));
    }
  };

  const getGoalTitle = (goalId: string | null) => {
    if (!goalId) return null;
    const goal = goals.find(g => g.id === goalId);
    return goal?.title;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Milestones</h1>
        <p className="text-muted-foreground">Track your progress step by step</p>
      </motion.div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Your Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {milestones.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground text-center py-8"
                >
                  No milestones yet. Click + to add one!
                </motion.p>
              ) : (
                milestones.map((milestone) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-gradient-card border border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      <motion.div whileTap={{ scale: 0.9 }} className="mt-1">
                        <Checkbox
                          checked={milestone.completed}
                          onCheckedChange={() => toggleMilestone(milestone.id, milestone.completed)}
                          className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={`font-semibold text-lg ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </h3>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                            )}
                          </div>
                          {milestone.goal_id && getGoalTitle(milestone.goal_id) && (
                            <Badge variant="secondary" className="shrink-0">
                              {getGoalTitle(milestone.goal_id)}
                            </Badge>
                          )}
                        </div>
                        {milestone.target_date && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Target: {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestonesView;
