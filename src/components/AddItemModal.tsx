import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemModal = ({ open, onOpenChange }: AddItemModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: formData.get('task-title') as string,
      task_date: today,
      alarm_time: formData.get('alarm-time') as string || null,
    });

    if (error) {
      toast.error('Failed to add task');
    } else {
      toast.success('Task added!');
      onOpenChange(false);
    }
    setLoading(false);
  };

  const handleAddTimeBlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('time_blocks').insert({
      user_id: user.id,
      title: formData.get('block-title') as string,
      description: formData.get('block-description') as string || null,
      block_date: today,
      start_time: formData.get('start-time') as string,
      end_time: formData.get('end-time') as string,
    });

    if (error) {
      toast.error('Failed to add time block');
    } else {
      toast.success('Time block added!');
      onOpenChange(false);
    }
    setLoading(false);
  };

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: formData.get('goal-title') as string,
      description: formData.get('goal-description') as string || null,
      goal_type: formData.get('goal-type') as string,
      target_date: formData.get('target-date') as string || null,
    });

    if (error) {
      toast.error('Failed to add goal');
    } else {
      toast.success('Goal added!');
      onOpenChange(false);
    }
    setLoading(false);
  };

  const handleAddMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('milestones').insert({
      user_id: user.id,
      title: formData.get('milestone-title') as string,
      description: formData.get('milestone-description') as string || null,
      target_date: formData.get('milestone-date') as string || null,
    });

    if (error) {
      toast.error('Failed to add milestone');
    } else {
      toast.success('Milestone added!');
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="task" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="task">Task</TabsTrigger>
                  <TabsTrigger value="block">Block</TabsTrigger>
                  <TabsTrigger value="goal">Goal</TabsTrigger>
                  <TabsTrigger value="milestone">Milestone</TabsTrigger>
                </TabsList>

                <TabsContent value="task">
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input id="task-title" name="task-title" required placeholder="e.g., Review project proposal" />
                    </div>
                    <div>
                      <Label htmlFor="alarm-time">Alarm Time (optional)</Label>
                      <Input id="alarm-time" name="alarm-time" type="time" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Task'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="block">
                  <form onSubmit={handleAddTimeBlock} className="space-y-4">
                    <div>
                      <Label htmlFor="block-title">Title</Label>
                      <Input id="block-title" name="block-title" required placeholder="e.g., Morning workout" />
                    </div>
                    <div>
                      <Label htmlFor="block-description">Description (optional)</Label>
                      <Textarea id="block-description" name="block-description" placeholder="Details..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input id="start-time" name="start-time" type="time" required />
                      </div>
                      <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input id="end-time" name="end-time" type="time" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Time Block'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="goal">
                  <form onSubmit={handleAddGoal} className="space-y-4">
                    <div>
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input id="goal-title" name="goal-title" required placeholder="e.g., Learn Spanish" />
                    </div>
                    <div>
                      <Label htmlFor="goal-description">Description (optional)</Label>
                      <Textarea id="goal-description" name="goal-description" placeholder="Details..." />
                    </div>
                    <div>
                      <Label htmlFor="goal-type">Type</Label>
                      <Select name="goal-type" defaultValue="yearly" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="target-date">Target Date (optional)</Label>
                      <Input id="target-date" name="target-date" type="date" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Goal'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="milestone">
                  <form onSubmit={handleAddMilestone} className="space-y-4">
                    <div>
                      <Label htmlFor="milestone-title">Milestone Title</Label>
                      <Input id="milestone-title" name="milestone-title" required placeholder="e.g., Complete course module 1" />
                    </div>
                    <div>
                      <Label htmlFor="milestone-description">Description (optional)</Label>
                      <Textarea id="milestone-description" name="milestone-description" placeholder="Details..." />
                    </div>
                    <div>
                      <Label htmlFor="milestone-date">Target Date (optional)</Label>
                      <Input id="milestone-date" name="milestone-date" type="date" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Milestone'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default AddItemModal;
