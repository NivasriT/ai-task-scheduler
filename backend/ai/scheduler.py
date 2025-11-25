from datetime import datetime, timedelta, time
from typing import List, Dict, Any, Optional
from enum import Enum
import random

class TimeBlock:
    def __init__(self, start_time: datetime, end_time: datetime, task=None):
        self.start_time = start_time
        self.end_time = end_time
        self.task = task
        self.duration = (end_time - start_time).total_seconds() / 60  # in minutes
    
    @property
    def is_available(self) -> bool:
        return self.task is None
    
    def __repr__(self) -> str:
        return f"TimeBlock({self.start_time.strftime('%Y-%m-%d %H:%M')} - {self.end_time.strftime('%H:%M')}, " \
               f"Task: {self.task['title'] if self.task else 'Available'})"

class Scheduler:
    def __init__(self, user_id: str, timezone: str = 'UTC'):
        self.user_id = user_id
        self.timezone = timezone
        self.work_hours = {
            'start': time(9, 0),    # 9 AM
            'end': time(21, 0)      # 9 PM
        }
        self.break_duration = 15    # minutes
        self.max_work_block = 90    # max minutes for a single work block
    
    def create_schedule(self, tasks: List[Dict[str, Any]], 
                       start_date: datetime, 
                       end_date: datetime) -> List[Dict[str, Any]]:
        """
        Create a schedule for the given tasks within the date range.
        
        Args:
            tasks: List of task dictionaries
            start_date: Start datetime for scheduling
            end_date: End datetime for scheduling
            
        Returns:
            List of scheduled tasks with time blocks
        """
        # Sort tasks by priority (descending) and duration (ascending)
        sorted_tasks = sorted(
            tasks,
            key=lambda x: (-x.get('priority', 2), x.get('estimated_duration', 30))
        )
        
        # Initialize time blocks for each day
        schedule = []
        current_date = start_date.date()
        end_date = end_date.date()
        
        while current_date <= end_date:
            if current_date.weekday() < 5:  # Only weekdays
                day_schedule = self._create_daily_schedule(current_date, sorted_tasks)
                schedule.extend(day_schedule)
            current_date += timedelta(days=1)
        
        return schedule
    
    def _create_daily_schedule(self, date: datetime.date, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create a schedule for a single day."""
        # Initialize time blocks for the day
        day_start = datetime.combine(date, self.work_hours['start'])
        day_end = datetime.combine(date, self.work_hours['end'])
        
        # Create time blocks of max_work_block minutes
        time_blocks = []
        current_time = day_start
        
        while current_time < day_end:
            block_end = min(
                current_time + timedelta(minutes=self.max_work_block),
                day_end
            )
            time_blocks.append(TimeBlock(current_time, block_end))
            current_time = block_end + timedelta(minutes=self.break_duration)
        
        # Assign tasks to time blocks
        scheduled_tasks = []
        remaining_tasks = tasks.copy()
        
        for task in tasks:
            if task in remaining_tasks:  # Skip already scheduled tasks
                task_duration = task.get('estimated_duration', 30)
                
                # Find a suitable time block
                for i, block in enumerate(time_blocks):
                    if block.is_available and block.duration >= task_duration * 0.8:  # Allow 80% of time to be used
                        # Assign task to this block
                        block.task = task
                        scheduled_tasks.append({
                            'task_id': task['id'],
                            'title': task['title'],
                            'start_time': block.start_time.isoformat(),
                            'end_time': (block.start_time + timedelta(minutes=task_duration)).isoformat(),
                            'priority': task.get('priority', 2),
                            'energy_level': task.get('energy_level', 3),
                            'category': task.get('category', 'OTHER')
                        })
                        
                        # Remove task from remaining tasks
                        remaining_tasks.remove(task)
                        break
        
        return scheduled_tasks
    
    def reschedule_task(self, task_id: str, current_schedule: List[Dict[str, Any]], 
                       new_time: datetime) -> List[Dict[str, Any]]:
        """
        Reschedule a specific task to a new time.
        
        Args:
            task_id: ID of the task to reschedule
            current_schedule: Current schedule
            new_time: New start time for the task
            
        Returns:
            Updated schedule
        """
        # Find the task in the current schedule
        task_to_move = None
        updated_schedule = []
        
        for scheduled_task in current_schedule:
            if scheduled_task['task_id'] == task_id:
                task_to_move = scheduled_task
            else:
                updated_schedule.append(scheduled_task)
        
        if not task_to_move:
            return current_schedule  # Task not found in schedule
        
        # Update task time
        task_duration = (datetime.fromisoformat(task_to_move['end_time']) - 
                        datetime.fromisoformat(task_to_move['start_time'])).total_seconds() / 60
        
        task_to_move['start_time'] = new_time.isoformat()
        task_to_move['end_time'] = (new_time + timedelta(minutes=task_duration)).isoformat()
        
        # Add the rescheduled task back to the schedule
        updated_schedule.append(task_to_move)
        
        # Sort the schedule by start time
        updated_schedule.sort(key=lambda x: x['start_time'])
        
        return updated_schedule

# Example usage
if __name__ == "__main__":
    # Example tasks
    tasks = [
        {
            'id': '1',
            'title': 'Complete project report',
            'priority': 3,  # High
            'estimated_duration': 120,  # 2 hours
            'energy_level': 4,
            'category': 'WORK'
        },
        {
            'id': '2',
            'title': 'Study for exam',
            'priority': 2,  # Medium
            'estimated_duration': 90,  # 1.5 hours
            'energy_level': 3,
            'category': 'STUDY'
        },
        {
            'id': '3',
            'title': 'Go to the gym',
            'priority': 1,  # Low
            'estimated_duration': 60,  # 1 hour
            'energy_level': 3,
            'category': 'HEALTH'
        }
    ]
    
    # Create scheduler instance
    scheduler = Scheduler(user_id='user123')
    
    # Create a schedule for the next 3 days
    start_date = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    end_date = start_date + timedelta(days=3)
    
    # Generate schedule
    schedule = scheduler.create_schedule(tasks, start_date, end_date)
    
    # Print the schedule
    print("Generated Schedule:")
    for item in schedule:
        print(f"{item['start_time']} - {item['end_time']}: {item['title']} (Priority: {item['priority']})")
    
    # Example of rescheduling a task
    if schedule:
        task_id = schedule[0]['task_id']
        new_time = datetime.fromisoformat(schedule[0]['start_time']) + timedelta(hours=2)
        updated_schedule = scheduler.reschedule_task(task_id, schedule, new_time)
        
        print("\nAfter rescheduling:")
        for item in updated_schedule:
            print(f"{item['start_time']} - {item['end_time']}: {item['title']}")
