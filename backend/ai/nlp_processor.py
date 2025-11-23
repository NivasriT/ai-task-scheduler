import spacy
from datetime import datetime, timedelta
import re
from enum import Enum
from typing import Dict, Any, Optional, List, Tuple

class TaskCategory(Enum):
    WORK = 'Work'
    STUDY = 'Study'
    PERSONAL = 'Personal'
    HEALTH = 'Health'
    OTHER = 'Other'

class NLPProcessor:
    def __init__(self):
        # Load the English language model
        self.nlp = spacy.load("en_core_web_sm")
        
        # Keywords for task categories
        self.category_keywords = {
            TaskCategory.WORK: ['work', 'job', 'meeting', 'email', 'report', 'project', 'presentation'],
            TaskCategory.STUDY: ['study', 'homework', 'assignment', 'read', 'learn', 'research', 'exam', 'quiz'],
            TaskCategory.PERSONAL: ['call', 'buy', 'shop', 'clean', 'organize', 'family', 'friend'],
            TaskCategory.HEALTH: ['gym', 'workout', 'run', 'exercise', 'yoga', 'meditate', 'doctor']
        }
        
        # Priority indicators
        self.priority_indicators = {
            'high': ['urgent', 'asap', 'immediately', 'important', 'critical', 'high priority'],
            'medium': ['should', 'moderate', 'medium priority'],
            'low': ['whenever', 'not urgent', 'low priority', 'someday']
        }
        
        # Energy level indicators (1-5 scale)
        self.energy_indicators = {
            1: ['simple', 'quick', 'easy', 'light', 'small'],
            2: ['moderate', 'medium', 'average'],
            3: ['standard', 'normal', 'regular'],
            4: ['challenging', 'complex', 'difficult', 'hard'],
            5: ['intense', 'exhausting', 'demanding', 'tough']
        }
        
        # Duration patterns (in minutes)
        self.duration_patterns = [
            (r'(\d+)\s*(minute|min)\b', 1),  # 30 min, 30minute
            (r'(\d+)\s*(hour|hr)\b', 60),    # 1 hour, 2hr
            (r'(\d+)\s*(day|days)\b', 1440)  # 1 day (in minutes)
        ]
    
    def parse_task(self, text: str) -> Dict[str, Any]:
        """
        Parse natural language text into a structured task.
        
        Args:
            text: Natural language task description (e.g., "Study for math exam tomorrow, high priority, 2 hours")
            
        Returns:
            Dict containing structured task information
        """
        doc = self.nlp(text.lower())
        
        # Initialize task with defaults
        task_data = {
            'title': text.strip(),
            'description': '',
            'category': TaskCategory.OTHER.value,
            'priority': 2,  # Default to medium priority
            'energy_level': 3,  # Default to medium energy
            'estimated_duration': 30,  # Default to 30 minutes
            'due_date': None
        }
        
        # Extract due date
        task_data['due_date'] = self._extract_due_date(text)
        
        # Extract duration
        task_data['estimated_duration'] = self._extract_duration(text)
        
        # Extract priority
        task_data['priority'] = self._extract_priority(text)
        
        # Extract energy level
        task_data['energy_level'] = self._extract_energy_level(text)
        
        # Determine category
        task_data['category'] = self._determine_category(text).value
        
        # Clean up title (remove extracted metadata)
        task_data['title'] = self._clean_title(text, task_data)
        
        return task_data
    
    def _extract_due_date(self, text: str) -> Optional[str]:
        """Extract due date from text using NLP."""
        doc = self.nlp(text)
        today = datetime.now()
        
        for ent in doc.ents:
            if ent.label_ == "DATE" or ent.label_ == "TIME":
                try:
                    # Try to parse the date
                    if "tomorrow" in ent.text.lower():
                        return (today + timedelta(days=1)).strftime('%Y-%m-%d')
                    elif "today" in ent.text.lower():
                        return today.strftime('%Y-%m-%d')
                    elif "next week" in ent.text.lower():
                        return (today + timedelta(weeks=1)).strftime('%Y-%m-%d')
                    # Add more date patterns as needed
                except:
                    continue
        
        return None
    
    def _extract_duration(self, text: str) -> int:
        """Extract estimated duration in minutes."""
        for pattern, multiplier in self.duration_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    value = int(match.group(1))
                    return value * multiplier
                except (ValueError, IndexError):
                    continue
        
        return 30  # Default to 30 minutes if no duration found
    
    def _extract_priority(self, text: str) -> int:
        """Extract task priority (1-3)."""
        text_lower = text.lower()
        
        # Check for high priority indicators
        for indicator in self.priority_indicators['high']:
            if indicator in text_lower:
                return 3
        
        # Check for low priority indicators
        for indicator in self.priority_indicators['low']:
            if indicator in text_lower:
                return 1
        
        # Default to medium priority
        return 2
    
    def _extract_energy_level(self, text: str) -> int:
        """Extract energy level (1-5)."""
        text_lower = text.lower()
        
        # Check energy level indicators
        for level, indicators in self.energy_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    return level
        
        # Default to medium energy
        return 3
    
    def _determine_category(self, text: str) -> TaskCategory:
        """Determine the most likely task category."""
        doc = self.nlp(text.lower())
        category_scores = {cat: 0 for cat in TaskCategory}
        
        # Score each category based on keyword matches
        for token in doc:
            for category, keywords in self.category_keywords.items():
                if token.text in keywords:
                    category_scores[category] += 1
        
        # Return the category with the highest score, default to OTHER
        return max(category_scores.items(), key=lambda x: x[1])[0] if max(category_scores.values()) > 0 else TaskCategory.OTHER
    
    def _clean_title(self, text: str, task_data: Dict[str, Any]) -> str:
        """Remove extracted metadata from the title."""
        title = text.strip()
        
        # Remove priority indicators
        for priority, indicators in self.priority_indicators.items():
            for indicator in indicators:
                title = re.sub(r'\b' + re.escape(indicator) + r'\b', '', title, flags=re.IGNORECASE)
        
        # Remove energy level indicators
        for level, indicators in self.energy_indicators.items():
            for indicator in indicators:
                title = re.sub(r'\b' + re.escape(indicator) + r'\b', '', title, flags=re.IGNORECASE)
        
        # Remove duration patterns
        for pattern, _ in self.duration_patterns:
            title = re.sub(pattern, '', title, flags=re.IGNORECASE)
        
        # Remove extra whitespace and punctuation
        title = re.sub(r'[\s,;]+', ' ', title).strip()
        title = re.sub(r'^[,\s]+|[,\s]+$', '', title)
        
        return title if title else text.strip()

# Example usage
if __name__ == "__main__":
    nlp_processor = NLPProcessor()
    
    test_cases = [
        "Study for math exam tomorrow, high priority, 2 hours",
        "Buy groceries after work, low energy",
        "Finish the quarterly report by Friday, urgent",
        "Call mom this weekend"
    ]
    
    for test in test_cases:
        print(f"\nInput: {test}")
        result = nlp_processor.parse_task(test)
        print("Parsed task:")
        for key, value in result.items():
            print(f"  {key}: {value}")
