import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { sounds } from '@/lib/sounds';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  alarm_time: string | null;
}

interface TimeBlock {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
}

const TodayView = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;

    // Fetch tasks
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error('Failed to load tasks');
      } else {
        setTasks(data || []);
      }
    };

    // Fetch time blocks
    const fetchTimeBlocks = async () => {
      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', user.id)
        .eq('block_date', today)
        .order('start_time', { ascending: true });

      if (error) {
        toast.error('Failed to load time blocks');
      } else {
        setTimeBlocks(data || []);
      }
    };

    fetchTasks();
    fetchTimeBlocks();

    // Set up real-time subscriptions
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    const blocksChannel = supabase
      .channel('blocks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_blocks',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTimeBlocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(blocksChannel);
    };
  }, [user, today]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    // Optimistic update
    const newStatus = !currentStatus;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));
    
    // Play sound
    if (newStatus) {
      sounds.complete();
    } else {
      sounds.toggle();
    }

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newStatus })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to update task');
      // Revert on error
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: currentStatus } : t));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">{format(new Date(), 'EEEE, MMMM d')}</h1>
        <p className="text-muted-foreground">Design your perfect day</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timeline Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Design Your Day
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {timeBlocks.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground text-center py-8"
                >
                  No time blocks yet. Click + to add one!
                </motion.p>
              ) : (
                timeBlocks.map((block) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{block.title}</h3>
                        {block.description && (
                          <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
                        )}
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Daily Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {tasks.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground text-center py-8"
                >
                  No tasks yet. Click + to add one!
                </motion.p>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id, task.completed)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </motion.div>
                    <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                    {task.alarm_time && (
                      <Bell className="w-4 h-4 text-muted-foreground" />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodayView;
