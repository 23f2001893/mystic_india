from database import get_db
from config import Session
from models import *
db=Session()
import math
categories = [
    {
        "slug": 'cosmic-myths',
        "name": 'Cosmic Beginnings & Creation Myths',
        "description": 'Stories about the origin of the universe and the gods.',
        "icon": '🌌',


    },
    {
        "slug": 'legends-gods',
        "name": 'Legends of the Gods',
        "description": 'Epic tales of the major deities and their divine plays.',
        "icon": '⚡',


    },
    {
        "slug": 'heroic-journeys',
        "name": 'Heroic Journeys',
        "description": 'Adventures of legendary heroes facing great challenges.',
        "icon": '🏹',


    },
    {
        "slug": 'wisdom-sages',
        "name": 'Wisdom from Sages & Rishis',
        "description": 'Profound teachings and lives of great sages.',
        "icon": '📜',


    },
    {
        "slug": 'divine-love',
        "name": 'Divine Love & Devotion',
        "description": 'Stories of unconditional love and surrender to the divine.',
        "icon": '💖',


    },
    {
        "slug": 'animals-symbolism',
        "name": 'Animals & Symbolism',
        "description": 'The significance of animals and symbols in mythology.',
        "icon": '🐘',


    },
    {
        "slug": 'power-responsibility',
        "name": 'Power & Responsibility',
        "description": 'Lessons on the use and misuse of power.',
        "icon": '👑',


    },
    {
        "slug": 'hidden-gems',
        "name": 'Hidden Gems & Rare Stories',
        "description": 'Lesser-known but fascinating tales from Indian mythology.',
        "icon": '💎',


    },
    {
        "slug": 'modern-lessons',
        "name": 'Lessons for Modern Times',
        "description": 'Ancient wisdom applied to contemporary life.',
        "icon": '💡',


    },
    {
        "slug": 'festivals',
        "name": 'Festivals & Mythological Roots',
        "description": 'The stories behind our celebrated festivals.',
        "icon": '🎉',


    },
];

for c in categories:
    cat=Categories(**c)
    db.add(cat)
db.commit()
print("categories added successfully")    



